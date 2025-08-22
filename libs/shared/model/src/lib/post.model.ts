import { Audited } from "./audited.model";
import { Subcategory } from "./subcategory.model";
import { Media } from './media.model';
import { Like } from "./likepost.model";
import { Comment } from "./comment.model";
import { User } from "./user.model";
import { Location } from "./location.model";

export interface Post extends Audited {
  postId: number;
  title: string;
  content: string;
  userId: number;
  subcategoryId: number;
  locationId?: number | null;
  isValid: boolean;

  subcategory: Subcategory;
  medias: Media[];
  likes: Like[];
  comments: Comment[];
  user: User;
  location?: Location | null;
}