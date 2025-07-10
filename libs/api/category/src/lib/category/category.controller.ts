import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from '../subcategory/subcategory.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getCategories(): Promise<CategoryEntity[]> {
    return this.categoryService.getCategories();
  }

  @Get('subcategories')
  async getSubCategories(
    @Query('categoryId') categoryId: number,
  ): Promise<SubCategoryEntity[]> {
    if (categoryId == null) {
      throw new Error('Selectionner une catégorie');
    }
    return this.categoryService.getSubCategoriesOfCategory(categoryId);
  }
}
