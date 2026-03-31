import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { ManchePlace } from '@bourgad-monorepo/model';
import { ManchePlaceEntity } from './manche-place.entity';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface WikiPage {
  pageid: number;
  title: string;
}

interface Coords {
  lat: number;
  lng: number;
}

@Injectable()
export class WikimancheIngestionService {
  private readonly logger = new Logger(WikimancheIngestionService.name);

  private readonly WIKIMANCHE_BASE = 'http://www.wikimanche.fr/api.php';
  private readonly IGN_GEOCODE_BASE = 'https://geocodage.ign.fr/look4/poi/search';

  /** 1 req/s vers Wikimanche */
  private readonly WIKIMANCHE_DELAY_MS = 1000;
  /** ~40 req/s vers IGN (25 ms entre requêtes) */
  private readonly IGN_DELAY_MS = 25;

  private readonly CATEGORIES = [
    'Commune de la Manche',
    'Château de la Manche',
    'Église de la Manche',
    'Plage de la Manche',
  ];

  constructor(private readonly dataSource: DataSource) {}

  // ─── Scheduler ────────────────────────────────────────────────────────────

  /** Ingestion complète chaque lundi à 3h du matin */
  @Cron('0 3 * * 1')
  async fullIngestion(): Promise<void> {
    this.logger.log('Démarrage de l\'ingestion complète Wikimanche');
    let totalFetched = 0;
    let totalEnriched = 0;
    let totalUpserted = 0;

    for (const category of this.CATEGORIES) {
      try {
        const { fetched, enriched, upserted } = await this.ingestCategory(category);
        totalFetched += fetched;
        totalEnriched += enriched;
        totalUpserted += upserted;
      } catch (err) {
        this.logger.error(`Erreur lors de l'ingestion de "${category}": ${err}`);
      }
    }

    this.logger.log(
      `Ingestion complète terminée — récupérés: ${totalFetched}, enrichis IGN: ${totalEnriched}, upsertés: ${totalUpserted}`,
    );
  }

  /** Synchronisation incrémentale toutes les 6h */
  @Cron('0 */6 * * *')
  async incrementalSync(): Promise<void> {
    this.logger.log('Démarrage de la synchronisation incrémentale Wikimanche');
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const changes = await this.fetchRecentChanges(since);
    this.logger.log(`${changes.length} modifications récentes trouvées`);

    let enriched = 0;
    let upserted = 0;

    for (const page of changes) {
      try {
        const coords = await this.fetchCoordinatesFromIGN(page.title);
        if (coords) enriched++;

        await this.upsertPlace({
          name: page.title,
          slug: page.title.replace(/ /g, '_'),
          category: 'recentchange',
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          wikimanchePageId: page.pageid,
          enrichedAt: coords ? new Date() : null,
        });
        upserted++;
      } catch (err) {
        this.logger.warn(`Erreur sur la page ${page.pageid} (${page.title}): ${err}`);
      }
    }

    this.logger.log(
      `Synchronisation incrémentale terminée — enrichis: ${enriched}, upsertés: ${upserted}`,
    );
  }

  // ─── Ingestion par catégorie ───────────────────────────────────────────────

  async ingestCategory(category: string): Promise<{ fetched: number; enriched: number; upserted: number }> {
    const pages = await this.fetchCategoryPages(category);
    this.logger.log(`Catégorie "${category}": ${pages.length} pages récupérées`);

    const pageids = pages.map(p => p.pageid);
    const coordMap = await this.fetchCoordinatesBatch(pageids);
    this.logger.log(`Catégorie "${category}": ${coordMap.size} coordonnées wiki trouvées`);

    let enriched = 0;
    let upserted = 0;

    for (const page of pages) {
      let coords: Coords | null = coordMap.get(page.pageid) ?? null;

      if (!coords) {
        coords = await this.fetchCoordinatesFromIGN(page.title);
        if (coords) enriched++;
      }

      await this.upsertPlace({
        name: page.title,
        slug: page.title.replace(/ /g, '_'),
        category,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        wikimanchePageId: page.pageid,
        enrichedAt: coords ? new Date() : null,
      });
      upserted++;
    }

    return { fetched: pages.length, enriched, upserted };
  }

  // ─── MediaWiki helpers ─────────────────────────────────────────────────────

  async fetchCategoryPages(category: string): Promise<WikiPage[]> {
    const pages: WikiPage[] = [];
    let cmcontinue: string | undefined;

    do {
      const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: `Catégorie:${category}`,
        cmlimit: '500',
        format: 'json',
        ...(cmcontinue ? { cmcontinue } : {}),
      });

      await sleep(this.WIKIMANCHE_DELAY_MS);
      const res = await fetch(`${this.WIKIMANCHE_BASE}?${params}`);
      const data: any = await res.json();

      const members: any[] = data?.query?.categorymembers ?? [];
      pages.push(...members.map(m => ({ pageid: m.pageid as number, title: m.title as string })));

      cmcontinue = data?.continue?.cmcontinue;
    } while (cmcontinue);

    return pages;
  }

  async fetchCoordinatesBatch(pageids: number[]): Promise<Map<number, Coords>> {
    const coordMap = new Map<number, Coords>();

    for (let i = 0; i < pageids.length; i += 50) {
      const batch = pageids.slice(i, i + 50);
      const params = new URLSearchParams({
        action: 'query',
        prop: 'coordinates',
        pageids: batch.join('|'),
        format: 'json',
      });

      await sleep(this.WIKIMANCHE_DELAY_MS);
      const res = await fetch(`${this.WIKIMANCHE_BASE}?${params}`);
      const data: any = await res.json();

      const queryPages = data?.query?.pages ?? {};
      for (const [id, page] of Object.entries<any>(queryPages)) {
        const coord = page.coordinates?.[0];
        if (coord) {
          coordMap.set(Number(id), { lat: coord.lat, lng: coord.lon });
        }
      }
    }

    return coordMap;
  }

  async fetchRecentChanges(since: string): Promise<WikiPage[]> {
    const params = new URLSearchParams({
      action: 'query',
      list: 'recentchanges',
      rcprop: 'title|ids|timestamp',
      rclimit: '500',
      rcend: since,
      rcdir: 'older',
      format: 'json',
    });

    await sleep(this.WIKIMANCHE_DELAY_MS);
    const res = await fetch(`${this.WIKIMANCHE_BASE}?${params}`);
    const data: any = await res.json();

    const changes: any[] = data?.query?.recentchanges ?? [];
    // Dédoublonner par pageid
    const seen = new Set<number>();
    return changes
      .filter(c => {
        if (seen.has(c.pageid)) return false;
        seen.add(c.pageid);
        return true;
      })
      .map(c => ({ pageid: c.pageid as number, title: c.title as string }));
  }

  // ─── IGN fallback ──────────────────────────────────────────────────────────

  async fetchCoordinatesFromIGN(name: string): Promise<Coords | null> {
    try {
      const params = new URLSearchParams({ q: name, postcode: '50', limit: '1' });
      await sleep(this.IGN_DELAY_MS);
      const res = await fetch(`${this.IGN_GEOCODE_BASE}?${params}`);
      const data: any = await res.json();
      const feature = data?.features?.[0];
      if (feature?.geometry?.coordinates) {
        const [lng, lat] = feature.geometry.coordinates as [number, number];
        return { lat, lng };
      }
    } catch (err) {
      this.logger.debug(`IGN geocoding failed for "${name}": ${err}`);
    }
    return null;
  }

  // ─── Persistance ──────────────────────────────────────────────────────────

  async upsertPlace(data: Omit<ManchePlace, 'id' | 'createdAt'>): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ManchePlaceEntity)
      .values(data as any)
      .orUpdate(
        ['name', 'slug', 'category', 'lat', 'lng', 'enriched_at'],
        ['wikimanche_page_id'],
      )
      .execute();
  }
}
