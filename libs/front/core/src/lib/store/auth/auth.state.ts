import { User } from "@bourgad-monorepo/model";

export interface AuthState {
  loading: boolean;
  error: string | null;
  isTokenValid: boolean;
  token: string | null;
  isAuthenticated: boolean;
}

export const initialState: AuthState = {
  loading: false,
  error: null,
  isTokenValid: false,
  token: null,
  isAuthenticated: false,
};
