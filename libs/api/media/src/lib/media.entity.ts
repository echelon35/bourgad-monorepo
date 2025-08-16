import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Media } from '@bourgad-monorepo/model';

@Entity('medias')
export class MediaEntity implements Media {
  @PrimaryGeneratedColumn({ name: 'media_id' })
  mediaId: number;
  @Column({ name: 'url' })
  url: string;
  @Column({ name: 'type' })
  type: string;
  @Column({ name: 'size', nullable: true })
  size?: number;
  @Column({ name: 'format', nullable: true })
  format?: string;
  @Column({ name: 'duration', nullable: true })
  duration?: number;
  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;
  @Column({ name: 'title', nullable: true })
  title?: string;
  @Column({ name: 'description', nullable: true })
  description?: string;
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
