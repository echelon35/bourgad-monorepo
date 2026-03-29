import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { InitialState } from "./post.state";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { CommentDto, FullPostDto } from "@bourgad-monorepo/internal";
import { PostApiService } from "@bourgad-monorepo/core";
import { inject } from "@angular/core";

export const PostStore = signalStore(
    withState(InitialState),
    withMethods((postStore, postApiService = inject(PostApiService)) => {
        const loadPost = rxMethod<number>(
            pipe(
                tap(() => patchState(postStore, { loading: true })),
                switchMap((postId) => postApiService.getPost(postId)),
                tap({
                    next: (post: FullPostDto) => {
                        patchState(postStore, { loading: false, post });
                    },
                    error: (error) => { patchState(postStore, { error: error.message, loading: false }) }
                })
            )
        );

        const loadComments = rxMethod<number>(
            pipe(
                tap(() => patchState(postStore, { commentsLoading: true })),
                switchMap((postId) => postApiService.getComments(postId)),
                tap({
                    next: (comments: CommentDto[]) => {
                        patchState(postStore, { comments, commentsLoading: false });
                    },
                    error: () => patchState(postStore, { commentsLoading: false })
                })
            )
        );

        const postComment = rxMethod<{ postId: number; content: string }>(
            pipe(
                tap(() => patchState(postStore, { commentPosting: true })),
                switchMap(({ postId, content }) => postApiService.postComment(postId, content)),
                tap({
                    next: (comment: CommentDto) => {
                        patchState(postStore, {
                            comments: [...postStore.comments(), comment],
                            commentPosting: false,
                        });
                    },
                    error: () => patchState(postStore, { commentPosting: false })
                })
            )
        );

        return { loadPost, loadComments, postComment };
    })
)