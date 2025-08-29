import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialState } from "./category.state";
import { inject } from "@angular/core";
import { CategoryApiService } from "../../services/category.api.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { Category } from "@bourgad-monorepo/model";

export const CategoryStore = signalStore(
    { providedIn: 'root'},
    withState(initialState),
    withMethods((store, categoryApiService = inject(CategoryApiService)) => {
        const loadCategories = rxMethod<void>(
            pipe(
                switchMap(() => categoryApiService.getCategories()),
                tap((categories: Category[]) => {
                    console.log(categories);
                    patchState(store, { categories: categories });
                })
            )
        );

        return { loadCategories };
    }),
    withHooks({
        onInit: (store) => {
            store.loadCategories();
        }
    }),
    withProps((store) => ({
        categories$: store.categories
    })));