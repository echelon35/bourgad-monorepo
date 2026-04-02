import { EntitySchema } from 'typeorm';
import { ManchePlace } from '@bourgad-monorepo/model';

export const PlaceEntity = new EntitySchema<ManchePlace>({
  name: 'PlaceEntity',
  tableName: 'places',
  columns: {
    id: { type: Number, primary: true, generated: true, name: 'id' },
    name: { type: String, name: 'name' },
    slug: { type: String, name: 'slug' },
    category: { type: String, name: 'category' },
    source: { type: String, name: 'source' },
    externalId: { type: String, name: 'external_id' },
    lat: { type: 'double precision', name: 'lat', nullable: true },
    lng: { type: 'double precision', name: 'lng', nullable: true },
    point: { type: 'geometry', name: 'point', nullable: true },
    enrichedAt: { type: Date, name: 'enriched_at', nullable: true },
    createdAt: {
      type: Date,
      name: 'created_at',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  uniques: [
    { name: 'UQ_places_source_external_id', columns: ['source', 'externalId'] },
  ],
});
