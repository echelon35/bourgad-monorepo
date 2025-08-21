import { Organisation } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const OrganisationEntity = new EntitySchema<Organisation>({
    name: 'OrganisationEntity',
    tableName: 'organisations',
    columns: {
        organisationId: { type: Number, primary: true, generated: true, name: 'organisation_id' },
        name: { type: String, name: 'name' },
        siret_siren: { type: String, name: 'siret_siren' },
        adress: { type: String, name: 'adress' },
        phone: { type: String, name: 'phone', nullable: true },
        mail: { type: String, name: 'mail' },
        website: { type: String, name: 'website', nullable: true },
        hours: { type: 'json', name: 'hours', nullable: true },
    },
    relations: {
        organisationType: { type: 'many-to-one', target: 'OrganisationTypeEntity', joinColumn: { name: 'organisationtype_id' }, inverseSide: 'organisations' },
    },
});