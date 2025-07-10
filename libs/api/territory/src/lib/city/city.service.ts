import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Geometry } from 'geojson';
import { CityEntity } from './city.entity';
import { Repository } from 'typeorm';

interface ICityDto {
  properties: ICityProperties;
  geometry: Geometry;
}

interface ICityProperties {
  code: string;
  nom: string;
  population: number;
  codesPostaux: string[];
}

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
  ) {}

  /**
   * Fetches cities from the French government API based on the department ID and saves them to the database.
   * @param deptId : The ID of the department to fetch cities for.
   */
  async updateCitiesFromDept(deptId: number): Promise<void> {
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codeDepartement=${deptId}&format=geojson&geometry=contour`,
      );
      const data = await response.json();
      const features: ICityDto[] = data.features;

      await Promise.all(
        features.map(async (feature: ICityDto) => {
          console.log(
            `Feature: ${feature.properties.nom} (${feature.properties.code})`,
          );
          await this.cityRepository.save({
            cityId: feature.properties.code,
            name: feature.properties.nom,
            population: feature.properties.population,
            surface: feature.geometry,
            postalCodes: feature.properties.codesPostaux || [], // Handle postal codes
          } as CityEntity);
        }),
      );
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }

  /**
   * Fetches a city by its ID from the database.
   * @param cityId : The ID of the city to fetch.
   * @returns The city object or null if not found.
   */
  async getCityById(cityId: number): Promise<CityEntity | null> {
    try {
      const city = await this.cityRepository.findOne({
        where: { cityId: cityId.toString() },
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
