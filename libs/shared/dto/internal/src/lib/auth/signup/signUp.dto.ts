import { IsNotEmpty, IsEmail, IsBoolean, IsOptional, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  firstname: string;
  @IsNotEmpty()
  lastname: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsBoolean()
  cguAccepted: boolean;
  @IsBoolean()
  @IsOptional()
  newsletterAccepted?: boolean;
}