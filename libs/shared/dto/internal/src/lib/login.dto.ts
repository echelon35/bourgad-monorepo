import { User } from "@bourgad-monorepo/model";

export interface LoginDto extends Partial<User> {
  mail: string;
  password: string;
}