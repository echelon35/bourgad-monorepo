import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCityByDeptQueryDto {
    @IsString()
    @IsNotEmpty()
    deptId: string;
}