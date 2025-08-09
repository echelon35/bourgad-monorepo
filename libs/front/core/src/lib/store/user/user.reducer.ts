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
  on(loginUser, (state, { user }) => {
    console.log('Updating user in reducer:', user);
    return {
      ...state,
      user,
      isAuthenticated: true
    }
  }),
  on(logoutUser, (state) => {
    console.log('Log out user');
    return {
      ...state,
      user: null, // Réinitialise l'état utilisateur à la déconnexion
      isAuthenticated: false,
    };
  })
);
