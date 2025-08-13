import { IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class AddSubcategoryDto {
    @IsNotEmpty()
    @IsNumber()
    subcategoryId: number;
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;
    @IsUrl()
    iconUrl: string;
    @IsString()
    description?: string;
}