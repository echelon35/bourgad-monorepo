import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './infrastructure/post.entity';
import { LikeEntity } from './infrastructure/like.entity';
import { CommentEntity } from './infrastructure/comment.entity';
import { PostController } from './controller/post.controller';
import { PostService } from './application/post.service';
import { MediaModule } from '@bourgad-monorepo/api/media';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LikeEntity, CommentEntity]), MediaModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [],
})
export class PostModule {}
