import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '@bourgad-monorepo/api/category';
import { Category } from '@bourgad-monorepo/model';
import { Categories } from './data/categories';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async seedCategories(){
    await this.categoryRepository.query("TRUNCATE TABLE categories CASCADE");

    const categories: Category[] = Categories;
    await this.categoryRepository.save(categories);
  }

}