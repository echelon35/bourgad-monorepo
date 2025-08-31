import { IsNotEmpty, IsNumber } from "class-validator";

export class GetPostDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;
}