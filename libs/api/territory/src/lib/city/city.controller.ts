import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { CityService } from './city.service';
import { CityEntity } from './city.entity';
import { Public } from '@bourgad-monorepo/back-core';
import { UpdateCityByDeptQueryDto, GetCityByIdParamDto } from '@bourgad-monorepo/internal';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('update-cities')
  @Public()
  async updateCities(
    @Query(new ValidationPipe({ transform: true })) query: UpdateCityByDeptQueryDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.cityService.updateCitiesFromDept(query.deptId);
    return { success: true, message: 'Cities updated successfully' };
  }

  @Get('city/:id')
  async getCityById(@Param() params: GetCityByIdParamDto): Promise<CityEntity | null> {
    const city = await this.cityService.getCityById(params.cityId);
    return city;
  }

  @Get('cities')
  async getCities(
    @Query('deptId') deptId?: number,
    @Query('name') name?: string,
  ): Promise<CityEntity[]> {
    return this.cityService.getCities(deptId, name);
  }
}
