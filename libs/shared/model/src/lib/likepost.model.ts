import { Post } from './post.model';
import { User } from './user.model';

export interface Like {
    likeId: number;
    userId: number;
    postId: number;

    user: User;
    post: Post;
}