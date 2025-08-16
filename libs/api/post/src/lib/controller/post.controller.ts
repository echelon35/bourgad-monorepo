import { Body, Controller, Post, Request } from "@nestjs/common";
import { PostService } from "../application/post.service";
import { CreatePostDto } from "@bourgad-monorepo/internal";
import { Post as PostModel } from "@bourgad-monorepo/model";
import 'multer';
import { MediaService, StorageService } from "@bourgad-monorepo/api/media";

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService
  ) {}

  @Post('/')
  async createPost(@Request() req: Express.Request, 
  @Body() createPostDto: CreatePostDto): Promise<PostModel> {
    console.log('createPost called with:', createPostDto);
    console.log('user:', req.user?.user);
    const userId = req.user?.user?.userId;
    if(userId == null){
        throw new Error('Une erreur est survenue lors de la sauvegarde du post');
    }

    const post: Partial<PostModel> = {
      ...createPostDto,
      userId: userId,
    }
    const savedPost = await this.postService.createPost(post);
    return savedPost;
  }
}