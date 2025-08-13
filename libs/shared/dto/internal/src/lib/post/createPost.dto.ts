import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  subcategoryId: number;
  
}