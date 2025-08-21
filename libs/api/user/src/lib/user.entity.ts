import { User } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const UserEntity = new EntitySchema<User>({
  name: 'UserEntity',
  tableName: 'users',
  columns: {
    userId: { type: Number, primary: true, generated: true, name: 'user_id' },
    firstname: { type: String, name: 'firstname' },
    lastname: { type: String, name: 'lastname' },
    mail: { type: String, name: 'mail' },
    password: { type: String, name: 'password' },
    phone: { type: String, name: 'phone', nullable: true },
    typeUtilisateur: { type: String, name: 'type_utilisateur' },
    presscardNumber: { type: String, name: 'presscard_number', nullable: true },
    title: { type: String, name: 'title', nullable: true },
    verifiedMail: { type: Boolean, name: 'verified_mail', default: false },
    cguAccepted: { type: Boolean, name: 'cgu_accepted', default: false },
    newsletterAccepted: { type: Boolean, name: 'newsletter_accepted', default: false },
    provider: { type: String, name: 'provider', default: 'LOCAL' },
    providerId: { type: String, name: 'provider_id', nullable: true },
    createdAt: { type: Date, name: 'created_at', default: () => 'CURRENT_TIMESTAMP' },
    updatedAt: { type: Date, name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
    deletedAt: { type: Date, name: 'deleted_at', nullable: true },
    cityId: { type: String, name: 'city_id', nullable: true },
  },
  relations: {
    city: { type: 'many-to-one', target: 'CityEntity', joinColumn: { name: 'city_id' }, inverseSide: 'users' },
    avatar: { type: 'one-to-one', target: 'MediaEntity', joinColumn: { name: 'avatar_id' }, inverseSide: 'user' },
    organisation: { type: 'many-to-one', target: 'OrganisationEntity', joinColumn: { name: 'organisation_id' }, inverseSide: 'users' },
    roles: { type: 'many-to-many', target: 'RoleEntity', joinTable: { name: 'roles_users' }, inverseSide: 'users' },
  },
});
