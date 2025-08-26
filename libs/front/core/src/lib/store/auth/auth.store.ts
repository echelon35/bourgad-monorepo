// auth.store.ts
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, map } from 'rxjs';
import { inject } from '@angular/core';
import { AuthState, initialState } from './auth.state';
import { LoginDto, TokenDto } from '@bourgad-monorepo/internal';
import { Router } from '@angular/router';
import { AuthenticationApiService } from '../../services/authentication.api.service';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withMethods((store, 
    authService = inject(AuthenticationApiService),
    router = inject(Router)) => ({
    // Méthode pour vérifier le token
    checkTokenValidity: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const token = localStorage.getItem('token'); // Récupère le token depuis localStorage
          if (!token) {
            return of(null).pipe(
              tap(() => patchState(store, { isTokenValid: false, loading: false }))
            );
          }
          return authService.checkExpiration().pipe(
            tap({
              next: (isValid) => {
                patchState(store, { isTokenValid: isValid, loading: false });
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
    ),
    // Méthode pour se connecter (optionnel)
    login: rxMethod<{ mail: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((credentials: LoginDto) =>
          authService.login(credentials).pipe(
            tap({
              next: (response: TokenDto) => {
                localStorage.setItem('auth-token', response.access_token);
                patchState(store, { token: response.access_token, isAuthenticated: true, isTokenValid: true, loading: false });
                //Enregistrer le user avec le userStore
                router.navigate(['/'])
                .then(() => {
                  window.location.reload();
                });
              },
              error: (error) => patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
    logout: rxMethod<void>(
      pipe(
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
    )
  })),
  // Effet déclenché à l'initialisation du store
  withHooks({
    onInit(store) {
        // Vérifie le token au démarrage
        const token = localStorage.getItem('auth-token');
        if (token) {
            patchState(store, { token, isAuthenticated: true });
            store.checkTokenValidity();
        }
    },
  })
);
