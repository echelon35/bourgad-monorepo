import { Controller, Get, Param, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { GetCityByIdParamDto } from '@bourgad-monorepo/internal';
import { City } from '@bourgad-monorepo/model';

@Controller('geo')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('city/:cityId')
  async getCityById(@Param() params: GetCityByIdParamDto): Promise<City | null> {
    const city = await this.cityService.getCityById(params.cityId);
    return city;
  }

  @Get('cities')
  async getCities(
    @Query('deptId') deptId?: number,
    @Query('name') name?: string,
  ): Promise<City[]> {
    return this.cityService.getCities(deptId, name);
  }
}
