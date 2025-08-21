import { Location } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const LocationEntity = new EntitySchema<Location>({
    name: 'LocationEntity',
    tableName: 'locations',
    columns: {
        locationId: {
            type: Number,
            primary: true,
            generated: 'increment',
            name: 'location_id',
        },
        name: {
            type: String,
            name: 'name',
        },
        label: {
            type: String,
            name: 'label',
        },
        providerId: {
            type: String,
            name: 'provider_id',
            nullable: true,
        },
        state: {
            type: String,
            name: 'state',
            nullable: true,
        },
        department: {
            type: String,
            name: 'department',
            nullable: true,
        },
        country: {
            type: String,
            name: 'country',
            nullable: true,
        },
        countryCode: {
            type: String,
            name: 'country_code',
            nullable: true,
        },
        point: {
            type: 'geometry',
            name: 'point',
        },
    },
});