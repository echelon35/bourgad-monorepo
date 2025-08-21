import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './controller/post.controller';
import { PostService } from './application/post.service';
import { MediaModule } from '@bourgad-monorepo/api/media';
import { UserModule } from '@bourgad-monorepo/api/user';
import { PostEntity } from './infrastructure/post.entity';
import { LikeEntity } from './infrastructure/like.entity';
import { CommentEntity } from './infrastructure/comment.entity';
import { LocationEntity } from './infrastructure/location.entity';
import { LocationController } from './controller/location.controller';
import { LocationService } from './application/location.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LikeEntity, CommentEntity, LocationEntity]), MediaModule, UserModule],
  controllers: [PostController, LocationController],
  providers: [PostService, LocationService],
  exports: [],
})
export class PostModule {}
