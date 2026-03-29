import { Body, Controller, Get, NotFoundException, Param, Post, Query, Request, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { PostService } from "../application/post.service";
import { CommentDto, CreateCommentDto, CreatePostDto, FeedPostDto, FullPostDto, GetPostDto, GetPostsAroundDto } from "@bourgad-monorepo/internal";
import { Post as PostModel } from "@bourgad-monorepo/model";
import 'multer';
import { MediaService, StorageService } from "@bourgad-monorepo/api/media";
import { UserService } from "@bourgad-monorepo/api/user";
import { Public } from "@bourgad-monorepo/api/core";

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService
  ) { }

  @Get('/')
  async getPostsAround(@Request() req: any,
    @Query(ValidationPipe) params: GetPostsAroundDto): Promise<FeedPostDto[]> {
    const userId = req.user?.user?.userId;
    if (userId == null) {
      throw new Error('Une erreur est survenue lors de la récupération du post ');
    }
    const city = await this.userService.getUserCity(userId);
    if (city == null || city.surface == null) {
      throw new Error('L\'utilisateur n\'a pas défini sa bourgade.');
    }
    console.log(params.onlyWithLocation, typeof params.onlyWithLocation);
    const posts = await this.postService.getPostsByLocation(city.surface, 50, params.onlyWithLocation);
    const feedPosts = posts.map(post => {
      return {
        id: post.postId,
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
          markerIconUrl: post.subcategory?.markerIconUrl
        },
      } as FeedPostDto;
    });
    return feedPosts;
  }

  @Get('/{:postId}')
  @Public()
  async getPost(@Request() req: Express.Request,
    @Param(ValidationPipe) params: GetPostDto): Promise<FullPostDto> {
    const post = await this.postService.getPostById(params.postId);

    if (post === null) {
      throw new NotFoundException(`Post ${params.postId} non trouvé.`);
    }

    return {
      id: post.postId,
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
        markerIconUrl: post.subcategory?.markerIconUrl,
      },
    } as FullPostDto;

  }

  @Get('/:postId/comments')
  @Public()
  async getComments(@Param('postId') postId: string): Promise<CommentDto[]> {
    const comments = await this.postService.getCommentsByPostId(Number(postId));
    return comments.map(c => ({
      commentId: c.commentId,
      content: c.content,
      userId: c.userId,
      postId: c.postId,
      createdAt: c.createdAt,
      userFirstname: c.user?.firstname ?? '',
      userLastname: c.user?.lastname ?? '',
      userAvatarUrl: (c.user as any)?.avatar?.url ?? null,
    }));
  }

  @Post('/:postId/comments')
  async createComment(@Request() req: any,
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto): Promise<CommentDto> {
    const userId = req.user?.user?.userId;
    if (!userId) throw new UnauthorizedException();
    const comment = await this.postService.createComment(Number(postId), userId, body.content);
    const user = req.user?.user;
    return {
      commentId: comment.commentId,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      createdAt: comment.createdAt,
      userFirstname: user?.firstname ?? '',
      userLastname: user?.lastname ?? '',
      userAvatarUrl: user?.avatar?.url ?? null,
    };
  }

  @Post('/')
  async createPost(@Request() req: any,
    @Body() createPostDto: CreatePostDto): Promise<PostModel> {
    console.log('createPost called with:', createPostDto);
    console.log('user:', req.user?.user);
    const userId = req.user?.user?.userId;
    if (userId == null) {
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