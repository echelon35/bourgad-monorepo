import { Body, Controller, Get, Post, Query, Request, ValidationPipe } from "@nestjs/common";
import { PostService } from "../application/post.service";
import { CreatePostDto, FeedPostDto, GetPostsAroundDto } from "@bourgad-monorepo/internal";
import { Post as PostModel } from "@bourgad-monorepo/model";
import 'multer';
import { MediaService, StorageService } from "@bourgad-monorepo/api/media";
import { UserService } from "@bourgad-monorepo/api/user";

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService
  ) {}

  @Get('/')
  async getPostsAround(@Request() req: Express.Request, 
  @Query(ValidationPipe) params: GetPostsAroundDto): Promise<FeedPostDto[]> {
    const userId = req.user?.user?.userId;
    if (userId == null) {
      throw new Error('Une erreur est survenue lors de la récupération des posts');
    }
    const city = await this.userService.getUserCity(userId);
    if(city == null || city.surface == null){
      throw new Error('L\'utilisateur n\'a pas défini sa bourgade.');
    }
    console.log(params.onlyWithLocation, typeof params.onlyWithLocation);
    const posts = await this.postService.getPostsByLocation(city.surface, 50, params.onlyWithLocation);
    const feedPosts = posts.map(post => {
      return {
        userAvatarUrl: post.user?.avatar?.url,
        userFirstname: post.user?.firstname,
        userLastname: post.user?.lastname,
        mediasUrls: post.medias.map(media => media.url),
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        point: post.location?.point,
        addressLabel: post.location?.label,
        subcategory: {
          id: post.subcategory?.subcategoryId,
          name: post.subcategory?.name,
          tagClass: post.subcategory?.tagClass,
        },
      } as FeedPostDto;
    });
    return feedPosts;
  }

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