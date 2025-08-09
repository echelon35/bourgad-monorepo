import { computed } from "@angular/core";
import { User, Media } from "@bourgad-monorepo/model";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";

const initialState = {
        id: 0,
        avatar: {} as Media,
        firstname: 'John',
        lastname: 'Doe',
        city: undefined
} as Partial<User>;

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        updateUser(user: Partial<User>) {
            patchState(store, user);
        },
        resetUser() {
            patchState(store, initialState);
        }   
    })),
    withComputed(({ firstname, lastname }) => ({
        username: computed(() => `${firstname?.() ?? ''} ${lastname?.() ?? ''}`),
    })),
);