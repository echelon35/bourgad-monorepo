import { Injectable } from "@nestjs/common";
import { PostEntity } from "../infrastructure/post.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "@bourgad-monorepo/model";

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>
  ) {}

  async createPost(postData: Partial<Post>): Promise<Post> {
    const savedPost = await this.postRepository.save(postData);
    return savedPost;
  }
}