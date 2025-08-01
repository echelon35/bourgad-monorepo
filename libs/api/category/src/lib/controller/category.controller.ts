import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from '../application/category.service';
import { Public } from '@bourgad-monorepo/api/core';
import { Category, Subcategory } from '@bourgad-monorepo/model';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  @Public()
  async getCategories(): Promise<Category[]> {
    const categories = await this.categoryService.getCategories();
    return categories;
  }

  @Get('subcategories')
  @Public()
  async getSubCategories(
    @Query('categoryId') categoryId: number,
  ): Promise<Subcategory[]> {
    if (categoryId == null) {
      throw new Error('Selectionner une catégorie');
    }
    return this.categoryService.getSubCategoriesOfCategory(categoryId);
  }
}
