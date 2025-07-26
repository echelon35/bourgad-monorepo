import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './infrastructure/category.entity';
import { CategoryService } from './application/category.service';
import { SubCategoryEntity } from './infrastructure/subcategory.entity';
import { CategoryController } from './controller/category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, SubCategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
