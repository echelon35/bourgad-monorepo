import { Media } from "@bourgad-monorepo/model";

export interface PhotoBatchState {
  importedMedias: Media[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  selectedMedia: Media | null;
}

export const photoBatchInitialState: PhotoBatchState = {
  importedMedias: [],
  loading: false,
  uploading: false,
  error: null,
  selectedMedia: null
};
