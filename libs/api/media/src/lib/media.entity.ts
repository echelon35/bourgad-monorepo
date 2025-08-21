import { Media } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';
import { AuditableSchema } from '@bourgad-monorepo/api/core';

export const MediaEntity = new EntitySchema<Media>({
  name: 'MediaEntity',
  tableName: 'medias',
  columns: {
    ...AuditableSchema,
    mediaId: { type: Number, primary: true, generated: true, name: 'media_id' },
    url: { type: String, name: 'url' },
    type: { type: String, name: 'type' },
    size: { type: Number, name: 'size', nullable: true },
    format: { type: String, name: 'format', nullable: true },
    duration: { type: Number, name: 'duration', nullable: true },
    thumbnailUrl: { type: String, name: 'thumbnail_url', nullable: true },
    title: { type: String, name: 'title', nullable: true },
    description: { type: String, name: 'description', nullable: true }
  },
  relations: {
      posts: { type: 'many-to-many', target: 'PostEntity', inverseSide: 'medias' },
  }
});
