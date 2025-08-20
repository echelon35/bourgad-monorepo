import { Injectable } from "@nestjs/common";
import { PostEntity } from "../infrastructure/post.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "@bourgad-monorepo/model";
import { Geometry } from "geojson";

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
        location: postData.location,
      });
      return manager.save(post);
    });
  }

  async getPostsByLocation(geometry: Geometry, perimeter = 50000, onlyWithLocation = false): Promise<Post[]> {

    const withLocation = onlyWithLocation ? 'AND location IS NOT NULL' : 'OR location IS NULL';
    return this.postRepository.query(`
      SELECT *, ST_AsGeoJSON(location)::json as "point" FROM posts
      WHERE ST_DWithin(location, ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), ${perimeter})
      ${withLocation}
    `);
  }
}