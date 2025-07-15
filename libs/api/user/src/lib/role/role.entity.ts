import { Role } from "@bourgad-monorepo/model";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('role')
export class RoleEntity implements Role {
    @PrimaryColumn({ name: 'role_id' })
    roleId: number;
    @Column({ name: 'name' })
    name: string;
    @Column({ name: 'description' })
    description: string;
}