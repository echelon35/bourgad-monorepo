import { IsNotEmpty, IsNumber } from "class-validator";

export class GetCityByIdParamDto {
    @IsNotEmpty()
    @IsNumber()
    cityId: number;
}