import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity, SubCategoryEntity } from '@bourgad-monorepo/api/category';
import { CityEntity, DepartmentEntity } from '@bourgad-monorepo/api/territory';
import { Category } from '@bourgad-monorepo/model';
import { CategoriesDto } from './data/categories.dto';
import { SubcategoriesDto } from './data/subcategories.dto';
import { CityDto, DepartmentDto } from '@bourgad-monorepo/external';
import { AddSubcategoryDto } from '@bourgad-monorepo/internal';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(SubCategoryEntity)
    private readonly subcategoryRepository: Repository<SubCategoryEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
  ) {}

  /** Seed categories from JSON */
  async seedCategories(){
    await this.categoryRepository.query("TRUNCATE TABLE categories CASCADE");

    const categories: Category[] = CategoriesDto;
    await this.categoryRepository.save(categories);
  }

  /** Seed subcategories from JSON */
  async seedSubcategories(){
    await this.subcategoryRepository.query("TRUNCATE TABLE subcategories CASCADE");

    const subcategories: AddSubcategoryDto[] = SubcategoriesDto;
    await this.subcategoryRepository.save(subcategories);
  }

  /**
   * Fetches all departments from the French government API and saves them to the database.
   */
  async seedDepartments(): Promise<void> {

    await this.departmentRepository.query("TRUNCATE TABLE departments CASCADE");

    try {
      const response = await fetch('https://geo.api.gouv.fr/departements');
      const data: DepartmentDto[] = await response.json();

      await Promise.all(
        data.map((department) => {
          console.log(`Department: ${department.nom} (${department.code})`);
          return this.departmentRepository.save({
            departmentId: department.code,
            name: department.nom,
            regionId: +department.codeRegion as number,
          } as DepartmentEntity);
        }),
      );
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }

  /**
   * Fetches cities from the French government API based on the department ID and saves them to the database.
   * @param deptId : The ID of the department to fetch cities for.
   */
  async seedCitiesFromDept(deptId: string): Promise<void> {

    if(deptId == null){
      throw new Error('Le numéro de département doit être renseigné.')
    }

    await this.cityRepository.query("TRUNCATE TABLE cities CASCADE");

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codeDepartement=${deptId}&format=geojson&geometry=contour`,
      );
      const data = await response.json();
      const features: CityDto[] = data.features;

      const dept = await this.departmentRepository.findOneBy({ departmentId: deptId });

      if(dept == null){
        throw new Error('');
      }

      await Promise.all(
        features.map(async (feature: CityDto) => {
          console.log(
            `Feature: ${feature.properties.nom} (${feature.properties.code})`,
          );
          await this.cityRepository.save({
            department: dept,
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

}