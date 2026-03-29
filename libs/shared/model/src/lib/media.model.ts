import { Audited } from "./audited.model";
import { Post } from "./post.model";
import { User } from "./user.model";

export interface Media extends Audited {
  mediaId: number;
  url: string;
  type: string;
  size?: number;
  format?: string;
  duration?: number;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  userId?: number | null;
  user?: User;
  posts: Post[];
}