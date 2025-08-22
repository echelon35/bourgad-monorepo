import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Post } from "@bourgad-monorepo/model";
import { Geometry } from "geojson";
import { PostEntity } from "../infrastructure/post.entity";

@Injectable()
export class PostService {
  constructor(
    private dataSource: DataSource
  ) {}

  async createPost(postData: Partial<Post>): Promise<Post> {
    return this.dataSource.getRepository(PostEntity).manager.transaction(async (manager) => {
      return manager.save(PostEntity, postData);
    });
  }

  async getPostsByLocation(geometry: Geometry, perimeter = 50000, onlyWithLocation: boolean): Promise<Post[]> {
    console.log('onlyWithLocation:', onlyWithLocation, typeof onlyWithLocation);
    const withLocation = onlyWithLocation ? ' AND posts."location_id" IS NOT NULL' : ' OR posts."location_id" IS NULL';
    console.log(withLocation);
    const posts = this.dataSource.getRepository(PostEntity).createQueryBuilder('posts')
      .leftJoinAndSelect('posts.location', 'locations')
      .leftJoinAndSelect('posts.medias', 'medias')
      .leftJoinAndSelect('posts.user', 'users')
      .select(['posts', 'locations', 'medias', 'users'])
      .where(`ST_DWithin(locations.point, ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), ${perimeter})${withLocation}`);
    return posts.getMany();
  }
}