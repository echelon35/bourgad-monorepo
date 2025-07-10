import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category/category.entity';
import { SubCategoryEntity } from './subcategory/subcategory.entity';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, SubCategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
