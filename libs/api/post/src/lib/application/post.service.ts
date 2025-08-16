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
    return this.postRepository.manager.transaction(async (manager) => {
      const post = manager.create(PostEntity, { 
        title: postData.title, 
        content: postData.content, 
        medias: postData.medias,
        subcategoryId: postData.subcategoryId,
        userId: postData.userId,
      });
      return manager.save(post);
    });
  }
}