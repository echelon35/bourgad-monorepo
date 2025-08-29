import { computed, inject } from "@angular/core";
import { User, Media, City } from "@bourgad-monorepo/model";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { initialState } from "./user.state";
import { UserApiService } from "../../services/user.api.service";
import { pipe, switchMap, tap } from "rxjs";
import { GeoApiService } from "../../services/geo.api.service";
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, 
        userApiService = inject(UserApiService),
        geoApiService = inject(GeoApiService)) => {
        function updateUser(user: User) {
            console.log('Updating user by UserStore:', user);
            patchState(store, { user, isAuthenticated: true });
        }
        const getUser = rxMethod<void> (
            pipe(
                switchMap(() => userApiService.getProfile()),
                tap((user: User) => {
                    console.log('Get user by UserStore:', user);
                    updateUser(user);
                    getUserCity(user.cityId);
                })
            )
        );

        const getUserCity = rxMethod<string>(
            pipe(
                switchMap((cityId: string) => geoApiService.getCityById(cityId)),
                tap((city: City) => {
                    console.log('Get User city by UserStore:', city);
                    patchState(store, { user: { ...store.user(), city }, userCityLoaded: true });
                })
            )
        );

        const updateCity = rxMethod<string>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap((cityId: string) =>  userApiService.changeTown(cityId).pipe(
                    tap((city) => {
                            console.log('City updated from UserStore:', city);
                            const updatedUser = { ...store.user(), cityId: city.cityId, city };
                            updateUser(updatedUser);
                            patchState(store, { user: updatedUser });
                        })
                    ))
            )
        );

        const changeAvatar = (avatar: Media) => {
            patchState(store, { user: { ...store.user(), avatar } });
        };
        const resetUser = () => {
            console.log('Resetting user by UserStore:');
            patchState(store, initialState);
        };
        return {
            updateUser,
            getUser,
            getUserCity,
            updateCity,
            changeAvatar,
            resetUser
        };
    }),
    withComputed(({ user }) => ({
        username: computed(() => `${user.firstname?.() ?? ''} ${user.lastname?.() ?? ''}`),
    })));