import { Post } from './post.model';
import { User } from './user.model';

export interface LikePost {
    likeId: number;
    userId: number;
    postId: number;

    user: User;
    post: Post;
}