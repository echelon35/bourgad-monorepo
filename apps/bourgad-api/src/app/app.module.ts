import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TerritoryModule,
  CityEntity,
  DepartmentEntity,
} from '@bourgad-monorepo/territory';
import {
  CategoryModule,
  CategoryEntity,
  SubCategoryEntity,
} from '@bourgad-monorepo/category';
import { CoreModule } from '@bourgad-monorepo/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    TerritoryModule,
    CategoryModule,
    CoreModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.BOURGAD_HOST,
      port: parseInt(process.env.BOURGAD_PORT),
      username: process.env.BOURGAD_USER,
      password: process.env.BOURGAD_PASSWORD,
      database: process.env.BOURGAD_DATABASE,
      entities: [
        CityEntity,
        DepartmentEntity,
        CategoryEntity,
        SubCategoryEntity,
      ],
      synchronize: true,
      // logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
