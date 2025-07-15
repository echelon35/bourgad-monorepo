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
import { CoreModule } from '@bourgad-monorepo/back-core';
import { AuthenticationModule } from '@bourgad-monorepo/authentication';
import { MediaEntity, MediaModule } from '@bourgad-monorepo/media';
import { UserEntity, UserModule, RoleEntity } from '@bourgad-monorepo/user';
import { OrganisationEntity, OrganisationTypeEntity } from '@bourgad-monorepo/organisation';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@bourgad-monorepo/back-core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    TerritoryModule,
    CategoryModule,
    CoreModule,
    MediaModule,
    UserModule,
    AuthenticationModule,
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
        MediaEntity,
        RoleEntity,
        OrganisationTypeEntity,
        OrganisationEntity,
        UserEntity
      ],
      synchronize: true,
      // logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },],
})
export class AppModule {}
