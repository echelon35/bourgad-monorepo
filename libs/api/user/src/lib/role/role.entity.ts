import { Role } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const RoleEntity = new EntitySchema<Role>({
    name: 'RoleEntity',
    tableName: 'roles',
    columns: {
        roleId: { type: Number, primary: true, name: 'role_id' },
        name: { type: String, name: 'name' },
        description: { type: String, name: 'description' },
    },
});