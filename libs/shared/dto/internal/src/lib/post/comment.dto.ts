export class CommentDto {
    commentId: number;
    content: string;
    userId: number;
    postId: number;
    createdAt: Date;
    userFirstname: string;
    userLastname: string;
    userAvatarUrl: string | null;
}

export class CreateCommentDto {
    content: string;
}
