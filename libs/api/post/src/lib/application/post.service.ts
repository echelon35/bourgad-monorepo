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

  async getPostsByLocation(geometry: Geometry, perimeter = 50000, onlyWithLocation = false): Promise<Post[]> {

    const withLocation = onlyWithLocation ? 'AND posts."location_id" IS NOT NULL' : 'OR posts."location_id" IS NULL';
    return this.dataSource.getRepository(PostEntity).query(`
      SELECT *, ST_AsGeoJSON(locations.point)::json as "point" FROM posts 
      LEFT JOIN locations ON posts."location_id" = locations."location_id" 
      WHERE ST_DWithin(locations.point, ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), ${perimeter})
      ${withLocation}
    `);
  }
}