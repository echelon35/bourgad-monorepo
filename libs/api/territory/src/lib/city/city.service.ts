import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from './city.entity';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../department/department.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly deptRepository: Repository<DepartmentEntity>,
  ) {}

  /**
   * Fetches a city by its ID from the database.
   * @param cityId : The ID of the city to fetch.
   * @returns The city object or null if not found.
   */
  async getCityById(cityId: string): Promise<CityEntity | null> {
    try {
      const city = await this.cityRepository.findOne({
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
  async getCities(deptId?: number, name?: string): Promise<CityEntity[]> {
    const queryBuilder = this.cityRepository.createQueryBuilder('city');

    if (deptId) {
      queryBuilder.where('city.departmentId = :deptId', { deptId });
    }

    if (name) {
      queryBuilder.andWhere('city.name ILIKE :name', { name: `%${name}%` });
    }

    return await queryBuilder.getMany();
  }
}
