import { User } from "@bourgad-monorepo/model";

export interface UserState {
  user: User;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
  userCityLoaded: boolean;
}

export const initialState = {
  user: {} as User,
  isAuthenticated: false,
  error: null,
  loading: false,
  userCityLoaded: false
} as UserState;