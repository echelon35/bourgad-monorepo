import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '@bourgad-monorepo/model';

@Entity('categories')
export class CategoryEntity implements Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId!: number;
  @Column({ name: 'name', nullable: false })
  name: string;
  @Column({ name: 'description', nullable: true })
  description: string;
  @Column({ name: 'tag_class', nullable: true })
  tagClass: string;
  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;
  @Column({ name: 'background_url', nullable: true })
  backgroundUrl: string;
}
