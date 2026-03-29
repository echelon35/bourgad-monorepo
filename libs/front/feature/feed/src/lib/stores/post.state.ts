import { CommentDto, FullPostDto } from "@bourgad-monorepo/internal";

export interface PostState {
    post: FullPostDto;
    comments: CommentDto[];
    commentsLoading: boolean;
    commentPosting: boolean;
    loading: boolean;
    error: string | null;
}

export const InitialState: PostState = {
    post: {} as FullPostDto,
    comments: [],
    commentsLoading: false,
    commentPosting: false,
    loading: false,
    error: null
}