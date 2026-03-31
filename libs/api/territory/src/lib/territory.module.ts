import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './city/city.controller';
import { DepartmentController } from './department/department.controller';
import { CityService } from './city/city.service';
import { DepartmentService } from './department/department.service';
import { DepartmentEntity } from './department/department.entity';
import { CityEntity } from './city/city.entity';
import { ManchePlaceEntity } from './manche-place/manche-place.entity';
import { ManchePlaceController } from './manche-place/manche-place.controller';
import { WikimancheIngestionController } from './manche-place/wikimanche-ingestion.controller';
import { ManchePlaceService } from './manche-place/manche-place.service';
import { WikimancheIngestionService } from './manche-place/wikimanche-ingestion.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([DepartmentEntity, CityEntity, ManchePlaceEntity]),
  ],
  controllers: [CityController, DepartmentController, ManchePlaceController, WikimancheIngestionController],
  providers: [CityService, DepartmentService, ManchePlaceService, WikimancheIngestionService],
  exports: [CityService],
})
export class TerritoryModule {}
