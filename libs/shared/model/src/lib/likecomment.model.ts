import { User } from "./user.model";

export interface LikeComment {
    likeId: number;
    userId: number;
    commentId: number;

    user: User;
    comment: Comment;
}