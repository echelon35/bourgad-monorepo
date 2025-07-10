import { Controller, Get, Param, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { CityEntity } from './city.entity';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('update-cities')
  async updateCities(
    @Query('deptId') deptId: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.cityService.updateCitiesFromDept(deptId);
    return { success: true, message: 'Cities updated successfully' };
  }

  @Get('city/:id')
  async getCityById(@Param('id') cityId: number): Promise<CityEntity | null> {
    const city = await this.cityService.getCityById(cityId);
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
