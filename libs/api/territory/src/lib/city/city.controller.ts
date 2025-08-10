import { Controller, Get, Param, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { CityEntity } from './city.entity';
import { GetCityByIdParamDto } from '@bourgad-monorepo/internal';

@Controller('geo')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('city/:cityId')
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
