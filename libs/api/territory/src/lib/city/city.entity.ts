import { Geometry } from 'geojson';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DepartmentEntity } from '../department/department.entity';
import { City } from '@bourgad-monorepo/model';

@Entity('cities')
export class CityEntity implements City {
  @PrimaryColumn({ name: 'city_id' })
  cityId: string;
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'population', nullable: true })
  population: number;
  @Column({ type: 'geometry', name: 'geometry' })
  surface: Geometry;
  // @Column({ name: 'department_id' })
  // departmentId: number;
  @Column({ name: 'postal_codes', array: true, type: 'text' })
  postalCodes: string[]; // Array of postal codes
  @ManyToOne(() => DepartmentEntity, (department) => department.departmentId)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;
}
