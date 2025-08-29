// auth.store.ts
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, map } from 'rxjs';
import { effect, inject } from '@angular/core';
import { AuthState, initialState } from './auth.state';
import { LoginDto, TokenDto } from '@bourgad-monorepo/internal';
import { Router } from '@angular/router';
import { AuthenticationApiService } from '../../services/authentication.api.service';
import { UserStore } from '../user/user.store';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withMethods((store, 
    authService = inject(AuthenticationApiService),
    router = inject(Router)) => {
    // Méthode pour vérifier le token
    const checkTokenValidity = rxMethod<string>(
      pipe(
        tap(() => {
          console.log('Checking token validity...');
          patchState(store, { loading: true, error: null });
        }),
        switchMap((token) => {
          if (!token) {
            return of(null).pipe(
              tap(() => patchState(store, { isTokenValid: false, loading: false }))
            );
          }
          return authService.checkExpiration().pipe(
            tap({
              next: (isValid) => {
                console.log('Token is valid:', isValid);
                patchState(store, { isTokenValid: isValid, loading: false, isAuthenticated: true });
              },
              error: (error) => {
                patchState(store, { error: error.message, isTokenValid: false, loading: false });
                const errorMsg = 'Votre session a expiré, veuillez-vous reconnecter.';
                router.navigate(['/login'], { queryParams: { error: errorMsg } });
              },
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isTokenValid: false, loading: false });
              return of(null);
            })
          );
        })
      )
    );

    const login = rxMethod<LoginDto> (
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((login) =>
          authService.login(login).pipe(
            tap({
              next: (response: TokenDto) => {
                console.log('Login successful, token received:', response);
                localStorage.setItem('auth-token', response.access_token);
                patchState(store, { token: response.access_token, isAuthenticated: true, isTokenValid: true, loading: false });
                router.navigate(['/'])
                .then(() => {
                  window.location.reload();
                });
              },
              error: (error) => patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      ));

    const logout = rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      map(() => {
        window.localStorage.removeItem('auth-token');
        patchState(store, { token: null, isTokenValid: false, loading: false });
          router.navigate(['/'])
          .then(() => {
            window.location.reload();
          });
        })
      )
    );

    return {
      checkTokenValidity,
      login,
      logout
    };
  }),
  withHooks({
    onInit(store) {
        const token = localStorage.getItem('auth-token');
        const userStore = inject(UserStore);
        console.log('AuthStore initialized with token:', token);
        if (token) {
            store.checkTokenValidity(token);
            
        }

        effect(() => {
          const isAuthenticated = store.isAuthenticated();
          console.log('isAuthenticated changed:', isAuthenticated);
          if (isAuthenticated) {
            console.log('User is authenticated, loading user data...');
            userStore.getUser();
          }
        });
    },
  })
);
