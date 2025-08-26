import { computed, inject } from "@angular/core";
import { User, Media, City } from "@bourgad-monorepo/model";
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { initialState } from "./user.state";
import { UserApiService } from "../../services/user.api.service";
import { tap } from "rxjs";
import { AuthStore } from "../auth/auth.store";
import { GeoApiService } from "../../services/geo.api.service";

export const UserStore = signalStore(
    { providedIn: 'root' },
    //Initial state
    withState(initialState),
    //Ecriture
    withMethods((store, 
        userApiService = inject(UserApiService),
        geoApiService = inject(GeoApiService)) => ({
        updateUser(user: User) {
            patchState(store, { user, isAuthenticated: true });
        },
        updateCity(cityId: string) {
            userApiService.changeTown(cityId).pipe(
                tap((city) => {
                    console.log('City updated to:', city);
                    const updatedUser = { ...store.user(), cityId: city.cityId, city };
                    this.updateUser(updatedUser);
                    patchState(store, { user: updatedUser });
                })
            ).subscribe();
        },
        changeAvatar(avatar: Media) {
            patchState(store, { user: { ...store.user(), avatar } });
        },
        resetUser() {
            patchState(store, initialState);
        },
        getUser() {
            userApiService.getProfile().subscribe((user: User) => {
                this.updateUser(user);
                console.log('User:', user);
                this.getUserCity(user.cityId);
            });
        },
        getUserCity(cityId: string) {
            geoApiService.getCityById(cityId).subscribe((city: City) => {
                console.log('User city:', city);
                patchState(store, { user: { ...store.user(), city }, userCityLoaded: true });
            });
        }
    })),
    //Lecture
    withComputed(({ user }) => ({
        username: computed(() => `${user.firstname?.() ?? ''} ${user.lastname?.() ?? ''}`),
    })),
    withHooks({
        onInit: (store, authStore = inject(AuthStore)) => {
            console.log('UserStore initialized');
            console.log('Is authenticated:', authStore.isAuthenticated());
            if(authStore.isAuthenticated()) {
                store.getUser();
            }
        }
    }));