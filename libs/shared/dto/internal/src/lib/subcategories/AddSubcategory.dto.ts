import { IsNotEmpty, IsNumber } from "class-validator";

export class AddSubcategoryDto {
    @IsNotEmpty()
    @IsNumber()
    subcategoryId: number;
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;
    iconUrl: string;
}