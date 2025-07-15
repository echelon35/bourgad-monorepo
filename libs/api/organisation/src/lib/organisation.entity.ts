import { Organisation } from '@bourgad-monorepo/model';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrganisationTypeEntity } from './organisation_type/organisation_type.entity';

@Entity('organisations')
export class OrganisationEntity implements Organisation {
    @PrimaryGeneratedColumn({ name: 'organisation_id' })
    organisationId: number;
    @Column({ name: 'name' })
    name: string;
    @Column({ name: 'siret_siren' })
    siret_siren: string;
    @Column({ name: 'adress' })
    adress: string;
    @Column({ name: 'phone', nullable: true })
    phone?: string;
    @Column({ name: 'mail' })
    mail: string;
    @Column({ name: 'website', nullable: true })
    website?: string;
    @Column({ name: 'hours', type: 'json', nullable: true })
    hours?: JSON;

    /** ASSOCIATIONS */
    @ManyToOne(() => OrganisationTypeEntity, (organisationType) => organisationType.organisationtypeId)
    @JoinColumn({ name: 'organisationtype_id' })
    organisationType: OrganisationTypeEntity;

}