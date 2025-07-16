import { IsNotEmpty, IsString } from "class-validator";

export class ResendConfirmationMailDto {
    @IsString()
    @IsNotEmpty()
    mail: string;
}