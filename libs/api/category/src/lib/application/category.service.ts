import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../infrastructure/category.entity';
import { SubCategoryEntity } from '../infrastructure/subcategory.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(SubCategoryEntity)
    private readonly subcategoryRepository: Repository<SubCategoryEntity>,
  ) {}

  async getCategories(): Promise<CategoryEntity[]> {
    return await this.categoryRepository.query(
      `SELECT * FROM categories ORDER BY name`,
    );
  }

  async getSubCategoriesOfCategory(
    categoryId: number,
  ): Promise<SubCategoryEntity[]> {
    return await this.categoryRepository.query(
      `SELECT subcategories.* FROM subcategories 
      LEFT JOIN categories ON categories.category_id = subcategories.category_id 
      WHERE categories.category_id = ${categoryId}
      ORDER BY subcategories.name`,
    );
  }
}
