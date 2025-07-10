import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentEntity } from './department.entity';
import { Repository } from 'typeorm';

interface IDepartmentDto {
  code: string;
  nom: string;
  codeRegion: string;
}

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly deptRepository: Repository<DepartmentEntity>
  ) {}

  /**
   * Fetches all departments from the French government API and saves them to the database.
   */
  async updateDepartments(): Promise<void> {
    try {
      const response = await fetch('https://geo.api.gouv.fr/departements');
      const data: IDepartmentDto[] = await response.json();

      await Promise.all(
        data.map((department) => {
          console.log(`Department: ${department.nom} (${department.code})`);
          return this.deptRepository.save({
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

}
