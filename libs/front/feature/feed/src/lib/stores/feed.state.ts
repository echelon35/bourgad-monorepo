import { FeedPostDto } from "@bourgad-monorepo/internal";

export interface FeedState {
  loading: boolean;
  error: string | null;
  posts: FeedPostDto[];
}

export const initialState: FeedState = {
  loading: false,
  error: null,
  posts: [],
};