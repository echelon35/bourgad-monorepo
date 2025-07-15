import { OrganisationType } from "@bourgad-monorepo/model";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrganisationEntity } from "../organisation.entity";

@Entity('organisation_types')
export class OrganisationTypeEntity implements OrganisationType {
  @PrimaryGeneratedColumn({ name: 'organisationtype_id' })
  organisationtypeId: number;
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'description' })
  description: string;

  /** ASSOCIATIONS */
  @OneToMany(() => OrganisationEntity, (organisation) => organisation.organisationType)
  organisations: OrganisationEntity[];
}