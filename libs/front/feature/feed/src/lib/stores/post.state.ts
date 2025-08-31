import { FullPostDto } from "@bourgad-monorepo/internal";

export interface PostState {
    post: FullPostDto;
    loading: boolean;
    error: string | null;
}

export const InitialState: PostState = {
    post: {} as FullPostDto,
    loading: false,
    error: null
}