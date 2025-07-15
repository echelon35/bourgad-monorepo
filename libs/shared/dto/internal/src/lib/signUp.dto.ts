import { User } from '@bourgad-monorepo/model';
import { IsNotEmpty, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class SignUpDto implements Partial<User> {
  @IsNotEmpty()
  firstname: string;
  @IsNotEmpty()
  lastname: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  cguAccepted?: boolean;
  @IsBoolean()
  @IsOptional()
  newsletterAccepted?: boolean;
}