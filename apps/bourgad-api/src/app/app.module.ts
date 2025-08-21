import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TerritoryModule,
  CityEntity,
  DepartmentEntity,
} from '@bourgad-monorepo/api/territory';
import {
  CategoryModule,
  CategoryEntity,
  SubCategoryEntity,
} from '@bourgad-monorepo/api/category';
import { CoreModule } from '@bourgad-monorepo/api/core';
import { AuthenticationModule } from '@bourgad-monorepo/api/authentication';
import { MediaEntity, MediaModule } from '@bourgad-monorepo/api/media';
import { UserEntity, UserModule, RoleEntity } from '@bourgad-monorepo/api/user';
import { OrganisationEntity, OrganisationTypeEntity } from '@bourgad-monorepo/api/organisation';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@bourgad-monorepo/api/core';
import { SeedModule } from '@bourgad-monorepo/api/seed';
import { CommentEntity, LikeEntity, PostEntity, LocationEntity, PostModule } from '@bourgad-monorepo/api/post';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/bourgad-api/.env',
      isGlobal: true,
    }),
    TerritoryModule,
    CategoryModule,
    CoreModule,
    MediaModule,
    UserModule,
    SeedModule,
    PostModule,
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
        UserEntity,
        PostEntity,
        CommentEntity,
        LikeEntity,
        LocationEntity
      ],
      synchronize: true,
      logging: true,
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
