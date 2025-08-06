import { IsEmail, IsStrongPassword } from "class-validator";

export class LoginDto {
  @IsEmail()
  mail: string;
  @IsStrongPassword()
  password: string;
}