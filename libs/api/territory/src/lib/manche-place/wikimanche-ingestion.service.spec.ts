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

  // ─── fetchCategoryPages ──────────────────────────────────────────────────

  describe('fetchCategoryPages', () => {
    it('retourne les pages d\'une catégorie sans pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: { categorymembers: [{ pageid: 1, title: 'Cherbourg-en-Cotentin' }] },
        }),
      });

      const pages = await service.fetchCategoryPages('Commune de la Manche');
      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual({ pageid: 1, title: 'Cherbourg-en-Cotentin' });
    });

    it('gère la pagination avec cmcontinue', async () => {
      mockFetch
        .mockResolvedValueOnce({
          json: async () => ({
            query: { categorymembers: [{ pageid: 1, title: 'Avranches' }] },
            continue: { cmcontinue: 'token123' },
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            query: { categorymembers: [{ pageid: 2, title: 'Granville' }] },
          }),
        });

      const pages = await service.fetchCategoryPages('Commune de la Manche');
      expect(pages).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[1][0]).toContain('cmcontinue=token123');
    });

    it('retourne un tableau vide si aucun résultat', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ query: { categorymembers: [] } }),
      });

      const pages = await service.fetchCategoryPages('Catégorie vide');
      expect(pages).toHaveLength(0);
    });
  });

  // ─── fetchCoordinatesBatch ───────────────────────────────────────────────

  describe('fetchCoordinatesBatch', () => {
    it('retourne les coordonnées pour les pages qui en ont', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            pages: {
              '1': { coordinates: [{ lat: 49.63, lon: -1.62 }] },
              '2': { /* pas de coordinates */ },
            },
          },
        }),
      });

      const map = await service.fetchCoordinatesBatch([1, 2]);
      expect(map.size).toBe(1);
      expect(map.get(1)).toEqual({ lat: 49.63, lng: -1.62 });
      expect(map.get(2)).toBeUndefined();
    });

    it('découpe en lots de 50 pageids', async () => {
      const pageids = Array.from({ length: 75 }, (_, i) => i + 1);
      mockFetch
        .mockResolvedValue({ json: async () => ({ query: { pages: {} } }) });

      await service.fetchCoordinatesBatch(pageids);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // ─── fetchCoordinatesFromIGN ─────────────────────────────────────────────

  describe('fetchCoordinatesFromIGN', () => {
    it('retourne les coordonnées depuis l\'API IGN', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          features: [{ geometry: { coordinates: [-1.62, 49.63] } }],
        }),
      });

      const coords = await service.fetchCoordinatesFromIGN('Mont Saint-Michel');
      expect(coords).toEqual({ lat: 49.63, lng: -1.62 });
      expect(mockFetch.mock.calls[0][0]).toContain('geocodage.ign.fr');
      expect(mockFetch.mock.calls[0][0]).toContain('postcode=50');
    });

    it('retourne null si aucune feature trouvée', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ features: [] }),
      });

      const coords = await service.fetchCoordinatesFromIGN('Lieu inconnu');
      expect(coords).toBeNull();
    });

    it('retourne null en cas d\'erreur réseau', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error'));

      const coords = await service.fetchCoordinatesFromIGN('Lieu');
      expect(coords).toBeNull();
    });
  });

  // ─── fetchRecentChanges ──────────────────────────────────────────────────

  describe('fetchRecentChanges', () => {
    it('dédoublonne les changements par pageid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            recentchanges: [
              { pageid: 1, title: 'Coutances', timestamp: '2026-03-30T01:00:00Z' },
              { pageid: 1, title: 'Coutances', timestamp: '2026-03-30T00:30:00Z' },
              { pageid: 2, title: 'Valognes', timestamp: '2026-03-30T00:15:00Z' },
            ],
          },
        }),
      });

      const changes = await service.fetchRecentChanges('2026-03-29T18:00:00.000Z');
      expect(changes).toHaveLength(2);
      expect(changes.map(c => c.pageid)).toEqual([1, 2]);
    });
  });

  // ─── upsertPlace ────────────────────────────────────────────────────────

  describe('upsertPlace', () => {
    it('appelle orUpdate avec le conflit sur wikimanchePageId', async () => {
      await service.upsertPlace({
        name: 'Plage de Barneville',
        slug: 'Plage_de_Barneville',
        category: 'Plage de la Manche',
        lat: 49.3,
        lng: -1.72,
        wikimanchePageId: 42,
        enrichedAt: new Date('2026-03-30'),
      });

      expect(mockInsertQueryBuilder.orUpdate).toHaveBeenCalledWith(
        ['name', 'slug', 'category', 'lat', 'lng', 'enriched_at'],
        ['wikimanche_page_id'],
      );
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  // ─── ingestCategory ──────────────────────────────────────────────────────

  describe('ingestCategory', () => {
    it('enrichit via IGN les pages sans coordonnées wiki et retourne les compteurs', async () => {
      // 1. categorymembers
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            categorymembers: [
              { pageid: 10, title: 'Barneville-Carteret' },
              { pageid: 11, title: 'Fermanville' },
            ],
          },
        }),
      });
      // 2. coordinates batch — pageid 10 a des coords, 11 non
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          query: {
            pages: {
              '10': { coordinates: [{ lat: 49.38, lon: -1.76 }] },
              '11': {},
            },
          },
        }),
      });
      // 3. IGN fallback pour pageid 11
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          features: [{ geometry: { coordinates: [-1.52, 49.68] } }],
        }),
      });

      const result = await service.ingestCategory('Commune de la Manche');

      expect(result.fetched).toBe(2);
      expect(result.enriched).toBe(1);   // 1 enrichi via IGN
      expect(result.upserted).toBe(2);
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });
  });
});
