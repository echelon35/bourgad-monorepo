import { Audited } from "./audited.model";
import { Post } from "./post.model";

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
  posts: Post[];
}