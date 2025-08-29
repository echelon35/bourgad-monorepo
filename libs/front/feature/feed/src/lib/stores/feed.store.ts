import { signalStore, withMethods, withState, patchState, withHooks, withProps } from "@ngrx/signals";
import { initialState } from "./feed.state";
import { AuthStore, PostApiService } from "@bourgad-monorepo/core";
import { effect, inject } from "@angular/core";
import { FeedPostDto } from "@bourgad-monorepo/internal";
import { pipe, switchMap, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';

export const FeedStore = signalStore(
  // État initial du store
  withState(initialState),
  // Méthodes du store
  withMethods((store, postApiService = inject(PostApiService)) => {
    const loadFeed = rxMethod<void> (
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => postApiService.getFeed()),
        tap((posts: FeedPostDto[]) => {
          console.log('Get posts from store:', posts);
          patchState(store, { posts, loading: false });
        })
      )
    );
    return {
      loadFeed
    };
  }),
  withHooks({
    onInit: (store, authStore = inject(AuthStore)) => {
      effect(() => {
        if(authStore.isAuthenticated()){
          store.loadFeed();
        }
      });
    }
  }),
  withProps((store) => ({
      posts$: toObservable(store.posts)
  }))
);

