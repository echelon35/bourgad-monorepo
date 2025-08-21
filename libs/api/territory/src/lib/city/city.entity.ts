import { City } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const CityEntity = new EntitySchema<City>({
  name: 'CityEntity',
  tableName: 'cities',
  columns: {
    cityId: { type: String, primary: true, name: 'city_id' },
    name: { type: String, name: 'name' },
    population: { type: Number, name: 'population', nullable: true },
    surface: { type: 'geometry', name: 'geometry' },
    postalCodes: { type: 'text', name: 'postal_codes', array: true },
  },
  relations: {
    department: { type: 'many-to-one', target: 'DepartmentEntity', joinColumn: { name: 'department_id' }, inverseSide: 'cities' },
  },
});
