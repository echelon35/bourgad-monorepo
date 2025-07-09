import { Audited } from './audited.model';

export interface Comment extends Audited {
    commentId: number;
    content: string;
    userId: number;
    postId: number;
}