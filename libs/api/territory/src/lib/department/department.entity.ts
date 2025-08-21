import { Department } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const DepartmentEntity = new EntitySchema<Department>({
  name: 'DepartmentEntity',
  tableName: 'departments',
  columns: {
    departmentId: { type: String, primary: true, name: 'department_id' },
    name: { type: String, name: 'name' },
    regionId: { type: Number, name: 'region_id' },
  },
});
