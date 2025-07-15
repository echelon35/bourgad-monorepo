import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@bourgad-monorepo/model';
import { RoleEntity } from './role/role.entity';
import { CityEntity } from '@bourgad-monorepo/territory';

@Entity('users')
export class UserEntity implements User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;
  @Column({ name: 'firstname' })
  firstname: string;
  @Column({ name: 'lastname' })
  lastname: string;
  @Column({ name: 'mail' })
  mail: string;
  @Column({ name: 'password' })
  password: string;
  @Column({ name: 'phone' })
  phone?: string | undefined;
  @Column({ name: 'type_utilisateur' })
  typeUtilisateur: string;
  @Column({ name: 'register_date' })
  registerDate: Date;
  @Column({ name: 'presscard_number' })
  presscardNumber?: string | undefined;
  @Column({ name: 'avatar_id' })
  avatarId: number;
  @Column({ name: 'city_id' })
  cityId: number;
  @Column({ name: 'title' })
  title: string;
  @Column({ name: 'verified_mail' })
  verifiedMail: boolean;
  @Column({ name: 'cgu_accepted' })
  cguAccepted: boolean;
  @Column({ name: 'newsletter_accepted' })
  newsletterAccepted: boolean;
  @Column({ name: 'provider' })
  provider: string;
  @Column({ name: 'provider_id' })
  providerId: string;
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  /** ASSOCIATIONS */
  @OneToMany(() => CityEntity, (city) => city.cityId)
  @JoinColumn({ name: 'city_id' })
  city: CityEntity;
  @OneToOne(() => MediaEntity, (media) => media.id)
  @JoinColumn({ name: 'avatar_id' })
  avatar: MediaEntity;
  @ManyToOne(() => OrganisationEntity, (organisation) => organisation.organisationId, { nullable: true })
  @JoinColumn({ name: 'organisation_id' })
  organisation?: OrganisationEntity | undefined;
  @ManyToMany(() => RoleEntity)
  @JoinTable({ name: 'roles_users' })
  roles: RoleEntity[];

}
