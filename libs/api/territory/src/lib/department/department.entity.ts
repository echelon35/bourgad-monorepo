import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Department } from '@bourgad-monorepo/model';

@Entity('departments')
export class DepartmentEntity implements Department {
  @PrimaryColumn({ name: 'department_id' })
  departmentId: string;
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'region_id' })
  regionId: number;
}
