import { createReducer, on } from '@ngrx/store';
import { loginUser, logoutUser } from './user.action';
import { User } from '@bourgad-monorepo/model';

export interface UserState {
  user: User | null; // null lorsque l'utilisateur n'est pas connecté
  isAuthenticated: boolean;
}

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
};

export const userReducer = createReducer(
  initialState,
  on(loginUser, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true
  })),
  on(logoutUser, (state) => ({
    ...state,
    user: null, // Réinitialise l'état utilisateur à la déconnexion
    isAuthenticated: false,
  }))
);
