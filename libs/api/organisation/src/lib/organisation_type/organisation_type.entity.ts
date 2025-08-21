import { OrganisationType } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const OrganisationTypeEntity = new EntitySchema<OrganisationType>({
  name: 'OrganisationTypeEntity',
  tableName: 'organisation_types',
  columns: {
    organisationtypeId: { type: Number, primary: true, generated: true, name: 'organisationtype_id' },
    name: { type: String, name: 'name' },
    description: { type: String, name: 'description' },
  },
  relations: {
    organisations: { type: 'one-to-many', target: 'OrganisationEntity', inverseSide: 'organisationType' },
  },
});