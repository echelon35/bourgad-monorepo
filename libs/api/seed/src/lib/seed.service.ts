import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CategoryEntity, SubCategoryEntity } from '@bourgad-monorepo/api/category';
import { CityEntity, DepartmentEntity } from '@bourgad-monorepo/api/territory';
import { Category, City, Department } from '@bourgad-monorepo/model';
import { CityDto, DepartmentDto } from '@bourgad-monorepo/external';
import { AddSubcategoryDto } from '@bourgad-monorepo/internal';
import { readFileSync } from 'fs';
import * as path from 'path';
import { csvJSONArray } from '@bourgad-monorepo/api/core';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  /** Seed categories from JSON */
  async seedCategories(){
    await this.dataSource.query("TRUNCATE TABLE categories CASCADE");
    const csvFilePath = path.resolve(__dirname, './data/categories.csv');
    const csv = readFileSync(csvFilePath, { encoding: 'utf-8' });
    const rawCategories = csvJSONArray(csv);
    const categories: Category[] = rawCategories.map((item: any) => ({
      name: item['name'],
      categoryId: +item['categoryId'],
      iconUrl: item['iconUrl'],
      backgroundUrl: item['backgroundUrl'],
      description: item['description'],
    }));
    console.log(categories);
    await this.dataSource.getRepository(CategoryEntity).save(categories);
  }

  /** Seed subcategories from JSON */
  async seedSubcategories(){
    await this.dataSource.getRepository(SubCategoryEntity).query("TRUNCATE TABLE subcategories CASCADE");
    const csvFilePath = path.resolve(__dirname, './data/subcategories.csv');
    const csv = readFileSync(csvFilePath, { encoding: 'utf-8' });
    const rawSubcategories = csvJSONArray(csv);
    const subcategories: AddSubcategoryDto[] = rawSubcategories.map((item: any) => ({
      subcategoryId: +item['subcategoryId'],
      name: item['name'],
      categoryId: +item['categoryId'],
      iconUrl: item['iconUrl'],
    }));
    console.log(subcategories);
    await this.dataSource.getRepository(SubCategoryEntity).save(subcategories);
  }

  /**
   * Fetches all departments from the French government API and saves them to the database.
   */
  async seedDepartments(): Promise<void> {

    await this.dataSource.getRepository(DepartmentEntity).query("TRUNCATE TABLE departments CASCADE");

    try {
      const response = await fetch('https://geo.api.gouv.fr/departements');
      const data: DepartmentDto[] = await response.json();

      await Promise.all(
        data.map((department) => {
          console.log(`Department: ${department.nom} (${department.code})`);
          return this.dataSource.getRepository(DepartmentEntity).save({
            departmentId: department.code,
            name: department.nom,
            regionId: +department.codeRegion as number,
          } as Department);
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
  async seedCitiesFromDept(deptId: string, truncate = true): Promise<void> {

    if(deptId == null){
      throw new Error('Le numéro de département doit être renseigné.')
    }

    if(truncate){
      await this.dataSource.getRepository(CityEntity).query("TRUNCATE TABLE cities CASCADE");
    }

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?codeDepartement=${deptId}&format=geojson&geometry=contour`,
      );
      const data = await response.json();
      const features: CityDto[] = data.features;

      const dept = await this.dataSource.getRepository(DepartmentEntity).findOneBy({ departmentId: deptId });

      if(dept == null){
        throw new Error('');
      }

      await Promise.all(
        features.map(async (feature: CityDto) => {
          console.log(
            `Feature: ${feature.properties.nom} (${feature.properties.code})`,
          );
          await this.dataSource.getRepository(CityEntity).save({
            department: dept,
            cityId: feature.properties.code,
            name: feature.properties.nom,
            population: feature.properties.population,
            surface: feature.geometry,
            postalCodes: feature.properties.codesPostaux || [], // Handle postal codes
          } as City);
        }),
      );
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }


  async seedDelegateCitiesFromDept(deptId:string, truncate = true): Promise<void> {
    if(deptId == null){
      throw new Error('Le numéro de département doit être renseigné.')
    }

    if(truncate){
      await this.dataSource.getRepository(CityEntity).query("TRUNCATE TABLE cities CASCADE");
    }

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes_associees_deleguees?codeDepartement=${deptId}&format=geojson&geometry=contour`,
      );
      const data = await response.json();
      const features: CityDto[] = data.features;

      const dept = await this.dataSource.getRepository(DepartmentEntity).findOneBy({ departmentId: deptId });

      if(dept == null){
        throw new Error('');
      }

      await Promise.all(
        features.map(async (feature: CityDto) => {
          console.log(
            `Feature: ${feature.properties.nom} (${feature.properties.code})`,
          );
          await this.dataSource.getRepository(CityEntity).save({
            department: dept,
            cityId: feature.properties.code,
            name: feature.properties.nom,
            population: feature.properties.population,
            surface: feature.geometry,
            postalCodes: feature.properties.codesPostaux || [], // Handle postal codes
          } as City);
        }),
      );
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }

}