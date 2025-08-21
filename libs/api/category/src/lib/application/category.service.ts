import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../infrastructure/category.entity';
import { SubCategoryEntity } from '../infrastructure/subcategory.entity';
import { Category, Subcategory } from '@bourgad-monorepo/model';

@Injectable()
export class CategoryService {
  constructor(private dataSource: DataSource
  ) {}

  async getCategories(): Promise<Category[]> {
    return await this.dataSource.getRepository(CategoryEntity).query(
      `SELECT 
      "category_id" as "categoryId", 
      "name","description", 
      "background_url" as "backgroundUrl", 
      "icon_url" as "iconUrl", 
      "tag_class" as "tagClass" 
      FROM categories ORDER BY name`,
    );
  }

  async getSubCategoriesOfCategory(
    categoryId: number,
  ): Promise<Subcategory[]> {
    return await this.dataSource.getRepository(SubCategoryEntity).query(
      `SELECT 
      subcategories."category_id" as "categoryId", subcategories."subcategory_id" as "subcategoryId",
      subcategories."name",subcategories."description",
      subcategories."icon_url" as "iconUrl", 
      subcategories."tag_class" as "tagClass" 
      FROM subcategories 
      LEFT JOIN categories ON categories.category_id = subcategories.category_id 
      WHERE categories.category_id = ${categoryId}
      ORDER BY subcategories.name`,
    );
  }
}
