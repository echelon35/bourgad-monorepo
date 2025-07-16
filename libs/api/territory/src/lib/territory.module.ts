import { Module } from '@nestjs/common';
import { CityController } from './city/city.controller';
import { DepartmentController } from './department/department.controller';
import { CityService } from './city/city.service';
import { DepartmentService } from './department/department.service';
import { DepartmentEntity } from './department/department.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from './city/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity, CityEntity]),],
  controllers: [CityController,DepartmentController],
  providers: [CityService,DepartmentService],
  exports: [CityService],
})
export class TerritoryModule {}
