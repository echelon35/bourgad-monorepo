import { patchState, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { InitialState } from "./post.state";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { FullPostDto } from "@bourgad-monorepo/internal";
import { PostApiService } from "@bourgad-monorepo/core";
import { inject } from "@angular/core";

export const PostStore = signalStore(
    withState(InitialState),
    withMethods((postStore, postApiService = inject(PostApiService)) => {
        const loadPost = rxMethod<number> (
            pipe(
                tap(() => patchState(postStore, { loading: true })),
                switchMap((postId) => postApiService.getPost(postId)),
                tap({
                    next: (post: FullPostDto) => { 
                        console.log('Get post by PostStore :', post)
                        patchState(postStore, { loading: false, post: post }) 
                    },
                    error: (error) => { patchState(postStore, { error: error.message, loading: false }) }
                })
            )
        )

        return { loadPost }
    })
)