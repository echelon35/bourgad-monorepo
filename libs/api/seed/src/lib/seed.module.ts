import { CategoryEntity, CategoryModule, SubCategoryEntity } from '@bourgad-monorepo/api/category';
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity, DepartmentEntity } from '@bourgad-monorepo/api/territory';

@Module({
  controllers: [],
  imports: [CategoryModule, TypeOrmModule.forFeature([CategoryEntity, DepartmentEntity, CityEntity, SubCategoryEntity])],
  providers: [SeedService],
  exports: [],
})
export class SeedModule {}
