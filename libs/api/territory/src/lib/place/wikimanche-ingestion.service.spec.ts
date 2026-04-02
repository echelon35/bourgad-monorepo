import { Test, TestingModule } from '@nestjs/testing';
import { WikimancheIngestionService } from './wikimanche-ingestion.service';
import { DataSource } from 'typeorm';

const mockExecute = jest.fn().mockResolvedValue({});
const mockInsertQueryBuilder = {
  insert: jest.fn().mockReturnThis(),
  into: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  orUpdate: jest.fn().mockReturnThis(),
  execute: mockExecute,
};
const mockDataSource = {
  createQueryBuilder: jest.fn().mockReturnValue(mockInsertQueryBuilder),
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WikimancheIngestionService', () => {
  let service: WikimancheIngestionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WikimancheIngestionService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<WikimancheIngestionService>(WikimancheIngestionService);
  });

  // ─── ingestFromGeoApiGouv ────────────────────────────────────────────────

  describe('ingestFromGeoApiGouv', () => {
    it('upserte les communes avec leurs coordonnées', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { nom: 'Cherbourg-en-Cotentin', code: '50129', centre: { type: 'Point', coordinates: [-1.6194, 49.6333] } },
          { nom: 'Avranches', code: '50025', centre: { type: 'Point', coordinates: [-1.3564, 48.6847] } },
        ]),
      });

      const result = await service.ingestFromGeoApiGouv();

      expect(result.fetched).toBe(2);
      expect(result.upserted).toBe(2);
      expect(mockExecute).toHaveBeenCalledTimes(2);

      const firstCall = mockInsertQueryBuilder.values.mock.calls[0][0];
      expect(firstCall.source).toBe('geoapi');
      expect(firstCall.externalId).toBe('50129');
      expect(firstCall.lat).toBe(49.6333);
      expect(firstCall.lng).toBe(-1.6194);
      expect(firstCall.category).toBe('Commune');
    });

    it('gère les communes sans coordonnées', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { nom: 'Commune sans coords', code: '50999' },
        ]),
      });

      const result = await service.ingestFromGeoApiGouv();
      expect(result.upserted).toBe(1);
      const call = mockInsertQueryBuilder.values.mock.calls[0][0];
      expect(call.lat).toBeNull();
      expect(call.lng).toBeNull();
      expect(call.enrichedAt).toBeNull();
    });

    it('lève une erreur si l\'API répond avec un statut non-OK', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
      await expect(service.ingestFromGeoApiGouv()).rejects.toThrow('GeoAPI Gouv HTTP 503');
    });
  });

  // ─── ingestFromWikidataSparql ────────────────────────────────────────────

  describe('ingestFromWikidataSparql', () => {
    it('upserte les lieux retournés par SPARQL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            bindings: [
              {
                item: { value: 'http://www.wikidata.org/entity/Q259463' },
                itemLabel: { value: 'Mont Saint-Michel' },
                lat: { value: '48.636' },
                lng: { value: '-1.511' },
                typeLabel: { value: 'île' },
              },
              {
                item: { value: 'http://www.wikidata.org/entity/Q6441' },
                itemLabel: { value: 'Granville' },
                lat: { value: '48.8352' },
                lng: { value: '-1.5987' },
              },
            ],
          },
        }),
      });

      const result = await service.ingestFromWikidataSparql();

      expect(result.fetched).toBe(2);
      expect(result.upserted).toBe(2);

      const firstCall = mockInsertQueryBuilder.values.mock.calls[0][0];
      expect(firstCall.source).toBe('wikidata');
      expect(firstCall.externalId).toBe('Q259463');
      expect(firstCall.lat).toBe(48.636);
      expect(firstCall.lng).toBe(-1.511);
      expect(firstCall.category).toBe('île');

      const secondCall = mockInsertQueryBuilder.values.mock.calls[1][0];
      expect(secondCall.category).toBe('Lieu'); // pas de typeLabel
    });

    it('ignore les entrées avec des coordonnées invalides (NaN)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            bindings: [
              {
                item: { value: 'http://www.wikidata.org/entity/Q1' },
                itemLabel: { value: 'Lieu invalide' },
                lat: { value: 'NaN' },
                lng: { value: 'NaN' },
              },
            ],
          },
        }),
      });

      const result = await service.ingestFromWikidataSparql();
      expect(result.fetched).toBe(1);
      expect(result.upserted).toBe(0);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('utilise wikibase:box et filtre sur la France (P17 Q142)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: { bindings: [] } }),
      });

      await service.ingestFromWikidataSparql();

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('wikibase%3Abox');
      expect(url).toContain('wd%3AQ142');
      expect(url).toContain('-1.95');
      expect(url).toContain('48.42');
      expect(url).toContain('-0.05');
      expect(url).toContain('49.74');
    });

    it('lève une erreur si SPARQL répond avec un statut non-OK', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
      await expect(service.ingestFromWikidataSparql()).rejects.toThrow('Wikidata SPARQL HTTP 429');
    });
  });

  // ─── fetchRecentChanges ──────────────────────────────────────────────────

  describe('fetchRecentChanges', () => {
    it('dédoublonne les changements par pageid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            recentchanges: [
              { pageid: 1, title: 'Coutances' },
              { pageid: 1, title: 'Coutances' },
              { pageid: 2, title: 'Valognes' },
            ],
          },
        }),
      });

      const changes = await service.fetchRecentChanges('2026-03-31T00:00:00Z');
      expect(changes).toHaveLength(2);
      expect(changes.map(c => c.pageid)).toEqual([1, 2]);
    });
  });

  // ─── fetchWikidataItemsBatch ─────────────────────────────────────────────

  describe('fetchWikidataItemsBatch', () => {
    it('retourne les QIDs Wikidata par pageid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            pages: {
              '1': { pageprops: { wikibase_item: 'Q259463' } },
              '2': { pageprops: {} },
            },
          },
        }),
      });

      const map = await service.fetchWikidataItemsBatch([1, 2]);
      expect(map.size).toBe(1);
      expect(map.get(1)).toBe('Q259463');
      expect(map.get(2)).toBeUndefined();
    });

    it('découpe en lots de 50 pageids', async () => {
      const pageids = Array.from({ length: 75 }, (_, i) => i + 1);
      mockFetch.mockResolvedValue({
        json: async () => ({ query: { pages: {} } }),
      });

      await service.fetchWikidataItemsBatch(pageids);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ─── fetchWikidataCoordsForQid ───────────────────────────────────────────

  describe('fetchWikidataCoordsForQid', () => {
    it('retourne les coordonnées depuis la propriété P625', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          entities: {
            Q259463: {
              claims: {
                P625: [{
                  mainsnak: {
                    datavalue: { value: { latitude: 48.636, longitude: -1.511 } },
                  },
                }],
              },
            },
          },
        }),
      });

      const coords = await service.fetchWikidataCoordsForQid('Q259463');
      expect(coords).toEqual({ lat: 48.636, lng: -1.511 });
    });

    it('retourne null si P625 absent', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ entities: { Q1: { claims: {} } } }),
      });

      const coords = await service.fetchWikidataCoordsForQid('Q1');
      expect(coords).toBeNull();
    });

    it('retourne null en cas d\'erreur réseau', async () => {
      mockFetch.mockRejectedValueOnce(new Error('timeout'));
      const coords = await service.fetchWikidataCoordsForQid('Q1');
      expect(coords).toBeNull();
    });
  });

  // ─── upsertPlace ────────────────────────────────────────────────────────

  describe('upsertPlace', () => {
    it('utilise la contrainte unique composite (source, external_id)', async () => {
      await service.upsertPlace({
        name: 'Mont Saint-Michel',
        slug: 'mont-saint-michel',
        category: 'île',
        source: 'wikidata',
        externalId: 'Q259463',
        lat: 48.636,
        lng: -1.511,
        enrichedAt: new Date('2026-03-31'),
      });

      expect(mockInsertQueryBuilder.orUpdate).toHaveBeenCalledWith(
        ['name', 'slug', 'category', 'lat', 'lng', 'enriched_at'],
        ['source', 'external_id'],
      );
      expect(mockExecute).toHaveBeenCalled();
    });
  });
});
