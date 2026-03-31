import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { ManchePlace } from '@bourgad-monorepo/model';
import { PlaceEntity } from './place.entity';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface WikiPage {
  pageid: number;
  title: string;
}

interface Coords {
  lat: number;
  lng: number;
}

interface SparqlBinding {
  item: { value: string };
  itemLabel: { value: string };
  lat: { value: string };
  lng: { value: string };
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

@Injectable()
export class WikimancheIngestionService {
  private readonly logger = new Logger(WikimancheIngestionService.name);

  private readonly WIKIMANCHE_BASE = 'http://www.wikimanche.fr/api.php';
  private readonly WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';
  private readonly GEOAPI_GOUV = 'https://geo.api.gouv.fr/communes';
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';

  // Bbox département Manche pour Overpass
  private readonly MANCHE_BBOX = '48.42,-1.95,49.76,-0.05';

  // Groupes de tags OSM à ingérer, avec leur catégorie Bourgad
  private readonly OVERPASS_GROUPS: Array<{ filter: string; category: string }> = [
    { filter: 'node["amenity"~"restaurant|cafe|bar|pub|fast_food|bakery|pharmacy|hospital|clinic|school|college|university|library|townhall|post_office|bank|fuel|parking|place_of_worship"]', category: 'Équipement' },
    { filter: 'node["shop"]', category: 'Commerce' },
    { filter: 'node["tourism"~"hotel|guest_house|hostel|camp_site|caravan_site|attraction|museum|viewpoint|information|artwork"]', category: 'Tourisme' },
    { filter: 'node["historic"~"monument|memorial|castle|fort|ruins|archaeological_site|wayside_cross|wayside_shrine|milestone"]', category: 'Patrimoine' },
    { filter: 'node["leisure"~"park|garden|beach_resort|playground|sports_centre|fitness_centre|swimming_pool|marina"]', category: 'Loisir' },
    { filter: 'node["natural"~"beach|peak|cliff|bay|cape|spring"]', category: 'Nature' },
  ];

  /** 1 req/s vers Wikimanche */
  private readonly WIKIMANCHE_DELAY_MS = 1000;

  constructor(private readonly dataSource: DataSource) {}

  // ─── Schedulers ───────────────────────────────────────────────────────────

  /** Ingestion complète chaque lundi à 3h du matin */
  @Cron('0 3 * * 1')
  async fullIngestion(): Promise<void> {
    this.logger.log('Démarrage de l\'ingestion complète');

    const [geoApi, wikidata, overpass] = await Promise.allSettled([
      this.ingestFromGeoApiGouv(),
      this.ingestFromWikidataSparql(),
      this.ingestFromOverpass(),
    ]);

    const geoApiResult   = geoApi.status   === 'fulfilled' ? geoApi.value   : { fetched: 0, upserted: 0 };
    const wikidataResult = wikidata.status === 'fulfilled' ? wikidata.value : { fetched: 0, upserted: 0 };
    const overpassResult = overpass.status === 'fulfilled' ? overpass.value : { fetched: 0, upserted: 0 };

    if (geoApi.status   === 'rejected') this.logger.error(`GeoAPI Gouv: ${geoApi.reason}`);
    if (wikidata.status === 'rejected') this.logger.error(`Wikidata SPARQL: ${wikidata.reason}`);
    if (overpass.status === 'rejected') this.logger.error(`Overpass OSM: ${overpass.reason}`);

    this.logger.log(
      `Ingestion terminée — GeoAPI: ${geoApiResult.upserted}/${geoApiResult.fetched}, ` +
      `Wikidata: ${wikidataResult.upserted}/${wikidataResult.fetched}, ` +
      `Overpass: ${overpassResult.upserted}/${overpassResult.fetched}`,
    );
  }

  /** Synchronisation incrémentale Wikimanche toutes les 6h */
  @Cron('0 */6 * * *')
  async incrementalSync(): Promise<void> {
    this.logger.log('Démarrage de la synchronisation incrémentale Wikimanche');
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const changes = await this.fetchRecentChanges(since);
    this.logger.log(`${changes.length} modifications récentes trouvées`);

    // Récupérer les QIDs Wikidata en batch
    const wikidataItemsMap = await this.fetchWikidataItemsBatch(changes.map(p => p.pageid));

    let enriched = 0;
    let upserted = 0;

    for (const page of changes) {
      try {
        let coords: Coords | null = null;
        const qid = wikidataItemsMap.get(page.pageid);

        if (qid) {
          coords = await this.fetchWikidataCoordsForQid(qid);
        }

        await this.upsertPlace({
          name: page.title,
          slug: slugify(page.title),
          category: 'recentchange',
          source: 'wikimanche',
          externalId: String(page.pageid),
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          enrichedAt: coords ? new Date() : null,
        });

        if (coords) enriched++;
        upserted++;
      } catch (err) {
        this.logger.warn(`Erreur sur la page ${page.pageid} (${page.title}): ${err}`);
      }
    }

    this.logger.log(
      `Synchronisation incrémentale terminée — enrichis: ${enriched}, upsertés: ${upserted}`,
    );
  }

  // ─── GeoAPI Gouv — communes département 50 ────────────────────────────────

  async ingestFromGeoApiGouv(): Promise<{ fetched: number; upserted: number }> {
    this.logger.log('GeoAPI Gouv: récupération des communes du département 50');

    const params = new URLSearchParams({
      codeDepartement: '50',
      fields: 'nom,code,centre',
      format: 'json',
    });

    const res = await fetch(`${this.GEOAPI_GOUV}?${params}`);
    if (!res.ok) throw new Error(`GeoAPI Gouv HTTP ${res.status}`);

    const communes = await res.json() as {
      nom: string;
      code: string;
      centre?: { type: string; coordinates: [number, number] };
    }[];

    this.logger.log(`GeoAPI Gouv: ${communes.length} communes reçues`);

    let upserted = 0;
    for (const commune of communes) {
      const coords = commune.centre?.coordinates;
      await this.upsertPlace({
        name: commune.nom,
        slug: slugify(commune.nom),
        category: 'Commune',
        source: 'geoapi',
        externalId: commune.code,
        lat: coords ? coords[1] : null,
        lng: coords ? coords[0] : null,
        enrichedAt: coords ? new Date() : null,
      });
      upserted++;
    }

    this.logger.log(`GeoAPI Gouv: ${upserted} communes upsertées`);
    return { fetched: communes.length, upserted };
  }

  // ─── Wikidata SPARQL — tous les lieux géolocalisés de la Manche ───────────

  async ingestFromWikidataSparql(): Promise<{ fetched: number; upserted: number }> {
    this.logger.log('Wikidata SPARQL: récupération des lieux de la Manche');

    // LIMIT 10000 = maximum absolu Wikidata. La bbox est découpée en 4 tranches
    // latitudinales égales (~0.335° chacune) pour rester sous le quota par tranche.
    //   T1 : 48.42 → 48.76  — Avranches, Pontorson, Mont-Saint-Michel
    //   T2 : 48.76 → 49.10  — Coutances, Saint-Lô, Carentan
    //   T3 : 49.10 → 49.42  — Valognes, Sainte-Mère-Église, Barneville
    //   T4 : 49.42 → 49.76  — Cherbourg, Cap de la Hague, Barfleur
    const BBOXES: Array<{ sw: string; ne: string; label: string }> = [
      { sw: 'Point(-1.95 48.42)', ne: 'Point(-0.05 48.76)', label: 'T1 — Avranches / Mont-Saint-Michel' },
      { sw: 'Point(-1.95 48.76)', ne: 'Point(-0.05 49.10)', label: 'T2 — Coutances / Saint-Lô' },
      { sw: 'Point(-1.95 49.10)', ne: 'Point(-0.05 49.42)', label: 'T3 — Valognes / Barneville' },
      { sw: 'Point(-1.95 49.42)', ne: 'Point(-0.05 49.76)', label: 'T4 — Cherbourg / Cap de la Hague' },
    ];

    const buildSparql = (sw: string, ne: string) => `
SELECT ?item ?itemLabel ?lat ?lng WHERE {
  SERVICE wikibase:box {
    ?item wdt:P625 ?coord.
    bd:serviceParam wikibase:cornerWest "${sw}"^^geo:wktLiteral.
    bd:serviceParam wikibase:cornerEast "${ne}"^^geo:wktLiteral.
  }
  BIND(geof:latitude(?coord)  AS ?lat)
  BIND(geof:longitude(?coord) AS ?lng)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
LIMIT 10000`.trim();

    let totalFetched = 0;
    let upserted = 0;
    // Dédoublonnage inter-tranches (items à cheval sur lat 49.10°)
    const seenQids = new Set<string>();

    for (const bbox of BBOXES) {
      this.logger.log(`Wikidata SPARQL: tranche ${bbox.label}`);

      const sparql = buildSparql(bbox.sw, bbox.ne);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55_000);

      let res: Response;
      try {
        res = await fetch(`${this.WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`, {
          headers: {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'Bourgad/1.0 (contact@bourgad.fr)',
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) throw new Error(`Wikidata SPARQL HTTP ${res.status} (tranche ${bbox.label})`);

      const data = await res.json() as { results: { bindings: SparqlBinding[] } };
      const bindings = data.results.bindings;
      this.logger.log(`Wikidata SPARQL tranche ${bbox.label}: ${bindings.length} résultats`);
      totalFetched += bindings.length;

      for (const b of bindings) {
        const qid = b.item.value.replace('http://www.wikidata.org/entity/', '');
        if (seenQids.has(qid)) continue;
        seenQids.add(qid);

        const lat = parseFloat(b.lat.value);
        const lng = parseFloat(b.lng.value);
        if (isNaN(lat) || isNaN(lng)) continue;

        await this.upsertPlace({
          name: b.itemLabel.value,
          slug: slugify(b.itemLabel.value),
          category: 'Lieu',
          source: 'wikidata',
          externalId: qid,
          lat,
          lng,
          enrichedAt: new Date(),
        });
        upserted++;
      }
    }

    this.logger.log(`Wikidata SPARQL: ${upserted} lieux upsertés (${totalFetched} résultats bruts)`);
    return { fetched: totalFetched, upserted };
  }

  // ─── Overpass OSM ─────────────────────────────────────────────────────────

  async ingestFromOverpass(): Promise<{ fetched: number; upserted: number }> {
    this.logger.log('Overpass OSM: démarrage de l\'ingestion');

    let totalFetched = 0;
    let upserted = 0;

    for (const group of this.OVERPASS_GROUPS) {
      const query = `[out:json][timeout:60];(${group.filter}(${this.MANCHE_BBOX}););out center;`;

      this.logger.log(`Overpass OSM: requête "${group.category}"`);

      // Retry avec backoff exponentiel sur les 429 (max 3 tentatives)
      const MAX_RETRIES = 3;
      let res: Response | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 65_000);
        try {
          res = await fetch(this.OVERPASS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }

        if (res.status === 429) {
          const waitMs = attempt * 15_000; // 15s, 30s, 45s
          this.logger.warn(
            `Overpass 429 pour "${group.category}" (tentative ${attempt}/${MAX_RETRIES}) — attente ${waitMs / 1000}s`,
          );
          await sleep(waitMs);
          res = null;
          continue;
        }
        break;
      }

      if (!res || !res.ok) {
        this.logger.error(`Overpass HTTP ${res?.status ?? 'N/A'} pour "${group.category}" — groupe ignoré`);
        await sleep(10_000);
        continue;
      }

      const data = await res.json() as { elements: OverpassElement[] };
      const elements = data.elements ?? [];
      this.logger.log(`Overpass OSM "${group.category}": ${elements.length} éléments reçus`);
      totalFetched += elements.length;

      for (const el of elements) {
        const lat = el.lat ?? el.center?.lat ?? null;
        const lng = el.lon ?? el.center?.lon ?? null;
        const tags = el.tags ?? {};
        const name = tags['name'] ?? tags['name:fr'] ?? null;

        if (!name || lat === null || lng === null) continue;

        await this.upsertPlace({
          name,
          slug: slugify(name),
          category: tags['amenity'] ?? tags['shop'] ?? tags['tourism']
            ?? tags['historic'] ?? tags['leisure'] ?? tags['natural']
            ?? group.category,
          source: 'osm',
          externalId: `${el.type}/${el.id}`,
          lat,
          lng,
          enrichedAt: new Date(),
        });
        upserted++;
      }

      // Pause entre chaque groupe : laisse le temps au serveur Overpass de libérer les slots
      await sleep(10_000);
    }

    this.logger.log(`Overpass OSM: ${upserted} lieux upsertés (${totalFetched} éléments bruts)`);
    return { fetched: totalFetched, upserted };
  }

  // ─── Wikimanche — recentchanges ────────────────────────────────────────────

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
    const data = await res.json() as { query: { recentchanges: { pageid: number; title: string }[] } };

    const changes = data?.query?.recentchanges ?? [];
    const seen = new Set<number>();
    return changes.filter(c => {
      if (seen.has(c.pageid)) return false;
      seen.add(c.pageid);
      return true;
    });
  }

  /**
   * Récupère le wikibase_item (QID Wikidata) par lots de 50 pages Wikimanche.
   */
  async fetchWikidataItemsBatch(pageids: number[]): Promise<Map<number, string>> {
    const itemMap = new Map<number, string>();

    for (let i = 0; i < pageids.length; i += 50) {
      const batch = pageids.slice(i, i + 50);
      const params = new URLSearchParams({
        action: 'query',
        prop: 'pageprops',
        ppprop: 'wikibase_item',
        pageids: batch.join('|'),
        format: 'json',
      });

      await sleep(this.WIKIMANCHE_DELAY_MS);
      const res = await fetch(`${this.WIKIMANCHE_BASE}?${params}`);
      const data = await res.json() as { query: { pages: Record<string, { pageprops?: { wikibase_item?: string } }> } };

      for (const [id, page] of Object.entries(data?.query?.pages ?? {})) {
        const qid = page.pageprops?.wikibase_item;
        if (qid) itemMap.set(Number(id), qid);
      }
    }

    return itemMap;
  }

  // ─── Wikidata — lookup individuel (incremental) ───────────────────────────

  async fetchWikidataCoordsForQid(qid: string): Promise<Coords | null> {
    try {
      const params = new URLSearchParams({
        action: 'wbgetentities',
        ids: qid,
        props: 'claims',
        format: 'json',
      });

      await sleep(this.WIKIMANCHE_DELAY_MS);
      const res = await fetch(`https://www.wikidata.org/w/api.php?${params}`);
      const data = await res.json() as {
        entities: Record<string, { claims?: { P625?: { mainsnak: { datavalue: { value: { latitude: number; longitude: number } } } }[] } }>;
      };

      const p625 = data?.entities?.[qid]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (p625?.latitude !== undefined && p625?.longitude !== undefined) {
        return { lat: p625.latitude, lng: p625.longitude };
      }
    } catch (err) {
      this.logger.debug(`Wikidata P625 failed for ${qid}: ${err}`);
    }
    return null;
  }

  // ─── Persistance ──────────────────────────────────────────────────────────

  async upsertPlace(data: Omit<ManchePlace, 'id' | 'createdAt' | 'point'>): Promise<void> {
    const point = (data.lat !== null && data.lng !== null)
      ? () => `ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)`
      : null;

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(PlaceEntity)
      .values({ ...data, point } as unknown as ManchePlace)
      .orUpdate(
        ['name', 'slug', 'category', 'lat', 'lng', 'point', 'enriched_at'],
        ['source', 'external_id'],
      )
      .execute();
  }
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
