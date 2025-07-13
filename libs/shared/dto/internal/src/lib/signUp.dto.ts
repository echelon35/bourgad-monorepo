import { User } from '@bourgad-monorepo/model';

export interface SignUpDto extends Partial<User> {
  firstname: string;
  lastname: string;
  mail: string;
  password: string;

  cguAccepted?: boolean;
  newsletterAccepted?: boolean;
}