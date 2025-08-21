import { Injectable } from '@nestjs/common';
import { CityEntity } from './city.entity';
import { DataSource } from 'typeorm';
import { City } from '@bourgad-monorepo/model';

@Injectable()
export class CityService {
  constructor(
    private dataSource: DataSource
  ) {}

  /**
   * Fetches a city by its ID from the database.
   * @param cityId : The ID of the city to fetch.
   * @returns The city object or null if not found.
   */
  async getCityById(cityId: string): Promise<City | null> {
    try {
      const city = await this.dataSource.getRepository(CityEntity).findOne({
        where: { cityId: cityId },
      });
      return city || null;
    } catch (error) {
      console.error('Error fetching city by ID:', error);
      return null;
    }
  }

    /**
   * Fetches cities from the database based on department ID and/or name.
   * @param deptId : The ID of the department to filter cities by (optional).
   * @param name : The name of the city to filter by (optional).
   * @returns An array of cities matching the criteria.
   */
  async getCities(deptId?: number, name?: string): Promise<City[]> {
    const queryBuilder = this.dataSource.getRepository(CityEntity).createQueryBuilder('city');

    if (deptId) {
      queryBuilder.where('city.departmentId = :deptId', { deptId });
    }

    if (name) {
      queryBuilder.andWhere('city.name ILIKE :name', { name: `%${name}%` });
    }

    return await queryBuilder.getMany();
  }
}
