import { signalStore, withMethods, withState, patchState, withHooks } from "@ngrx/signals";
import { photoBatchInitialState } from "./photo-batch.state";
import { MediaApiService } from "@bourgad-monorepo/core";
import { inject } from "@angular/core";
import { Media } from "@bourgad-monorepo/model";
import { pipe, switchMap, tap } from "rxjs";
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export const PhotoBatchStore = signalStore(
  withState(photoBatchInitialState),
  withMethods((store, mediaApiService = inject(MediaApiService)) => {
    const loadImportedMedias = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => mediaApiService.getImportedMedias()),
        tap((importedMedias: Media[]) => {
          patchState(store, { importedMedias, loading: false });
        })
      )
    );

    const uploadMedias = (files: File[]) => {
      patchState(store, { uploading: true, error: null });
      return mediaApiService.uploadMedias(files).then((newMedias: Media[]) => {
        patchState(store, {
          importedMedias: [...store.importedMedias(), ...newMedias],
          uploading: false
        });
        return newMedias;
      }).catch((err) => {
        patchState(store, { uploading: false, error: "Erreur lors de l'upload des photos." });
        throw err;
      });
    };

    const selectMedia = (media: Media | null) => {
      patchState(store, { selectedMedia: media });
    };

    const removeMediaFromImported = (mediaId: number) => {
      patchState(store, {
        importedMedias: store.importedMedias().filter(m => m.mediaId !== mediaId),
        selectedMedia: null
      });
    };

    return {
      loadImportedMedias,
      uploadMedias,
      selectMedia,
      removeMediaFromImported
    };
  }),
  withHooks({
    onInit: (store) => {
      store.loadImportedMedias();
    }
  })
);
