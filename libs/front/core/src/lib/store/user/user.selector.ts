import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

// Sélecteur pour l'état utilisateur global
export const selectUserState = createFeatureSelector<UserState>('user');

// Sélecteur pour récupérer l'utilisateur
export const selectUser = createSelector(
  selectUserState,
  (state) => state.user
);

// Selector pour savoir si l'utilisateur est connecté
export const selectIsAuthenticated = createSelector(
    selectUserState,
    (state) => state.isAuthenticated
);