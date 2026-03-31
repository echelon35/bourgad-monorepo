import { Point } from 'geojson';

export interface ManchePlace {
  id: number;
  name: string;
  slug: string;
  category: string;
  /** 'geoapi' | 'wikidata' | 'wikimanche' */
  source: string;
  /** INSEE code, QID Wikidata (ex: Q3428), ou pageid Wikimanche */
  externalId: string;
  lat: number | null;
  lng: number | null;
  point: Point | null;
  enrichedAt: Date | null;
  createdAt: Date;
}
