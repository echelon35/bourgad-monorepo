import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from '../category/category.entity';
import { Subcategory } from '@bourgad-monorepo/model';

@Entity('subcategories')
export class SubCategoryEntity implements Subcategory {
  @PrimaryGeneratedColumn({ name: 'subcategory_id' })
  subcategoryId: number;
  @Column({ name: 'category_id' })
  categoryId: number;
  @Column({ name: 'name', nullable: false })
  name: string;
  @Column({ name: 'description', nullable: true })
  description: string;
  @Column({ name: 'tag_class', nullable: true })
  tagClass: string;
  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @ManyToOne(() => CategoryEntity, (category) => category.categoryId)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
