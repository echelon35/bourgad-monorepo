import { CategoryEntity, CategoryModule } from '@bourgad-monorepo/api/category';
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [],
  imports: [CategoryModule, TypeOrmModule.forFeature([CategoryEntity])],
  providers: [SeedService],
  exports: [],
})
export class SeedModule {}
