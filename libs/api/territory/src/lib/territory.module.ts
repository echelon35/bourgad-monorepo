import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './city/city.controller';
import { DepartmentController } from './department/department.controller';
import { CityService } from './city/city.service';
import { DepartmentService } from './department/department.service';
import { DepartmentEntity } from './department/department.entity';
import { CityEntity } from './city/city.entity';
import { PlaceEntity } from './place/place.entity';
import { PlaceController } from './place/place.controller';
import { WikimancheIngestionController } from './place/wikimanche-ingestion.controller';
import { PlaceService } from './place/place.service';
import { WikimancheIngestionService } from './place/wikimanche-ingestion.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DepartmentEntity, CityEntity, PlaceEntity]),
  ],
  controllers: [CityController, DepartmentController, PlaceController, WikimancheIngestionController],
  providers: [CityService, DepartmentService, PlaceService, WikimancheIngestionService],
  exports: [CityService],
})
export class TerritoryModule {}
