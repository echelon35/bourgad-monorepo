import { Category } from "@bourgad-monorepo/model";

export interface CategoryState {
  loading: boolean;
  error: string | null;
  categories: Category[];
}

export const initialState: CategoryState = {
  loading: false,
  error: null,
  categories: []
};
