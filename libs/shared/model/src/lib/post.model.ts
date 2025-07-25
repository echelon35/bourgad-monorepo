import { Geometry } from "geojson";
import { Audited } from "./audited.model";
import { Subcategory } from "./subcategory.model";
import { Media } from './media.model';
import { LikePost } from "./likepost.model";
import { Comment } from "./comment.model";
import { User } from "./user.model";

export interface Post extends Audited {
  postId: number;
  title: string;
  content: string;
  userId: number;
  subcategoryId: number;
  location?: Geometry;
  isValid: boolean;

  subcategory: Subcategory;
  medias: Media[];
  likes: LikePost[];
  comment: Comment[];
  user: User;
}