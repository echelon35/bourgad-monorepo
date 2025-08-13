import { Body, Controller, Post, Request } from "@nestjs/common";
import { PostService } from "../application/post.service";
import { CreatePostDto } from "@bourgad-monorepo/internal";
import { Post as PostModel } from "@bourgad-monorepo/model";
import * as Express from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/')
  async createPost(@Request() req: Express.Request, @Body() createPostDto: CreatePostDto): Promise<PostModel> {
    const userId = req.user?.user?.userId;
    if(userId == null){
        throw new Error('Une erreur est survenue lors de la sauvegarde du post');
    }
    const post: Partial<PostModel> = {
      ...createPostDto,
      userId
    }
    const savedPost = await this.postService.createPost(post);
    return savedPost;
  }
}