import { EntitySchema } from 'typeorm';
import { ManchePlace } from '@bourgad-monorepo/model';

export const ManchePlaceEntity = new EntitySchema<ManchePlace>({
  name: 'ManchePlaceEntity',
  tableName: 'manche_places',
  columns: {
    id: { type: Number, primary: true, generated: true, name: 'id' },
    name: { type: String, name: 'name' },
    slug: { type: String, name: 'slug' },
    category: { type: String, name: 'category' },
    lat: { type: 'double precision', name: 'lat', nullable: true },
    lng: { type: 'double precision', name: 'lng', nullable: true },
    wikimanchePageId: { type: Number, name: 'wikimanche_page_id', unique: true },
    enrichedAt: { type: Date, name: 'enriched_at', nullable: true },
    createdAt: {
      type: Date,
      name: 'created_at',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});
