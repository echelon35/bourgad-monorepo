import { Audited } from './audited.model';
import { Post } from './post.model';
import { User } from './user.model';

export interface Comment extends Audited {
    commentId: number;
    content: string;
    userId: number;
    postId: number;
    post: Post;
    user: User;
}