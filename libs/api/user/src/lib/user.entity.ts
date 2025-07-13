import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { City, Media, Organisation, Role, User } from '@bourgad-monorepo/model';

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
  @Column({ name: 'role_id' })
  roleId: Role;
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
  @Column({ name: 'city' })
  city: City;
  @Column({ name: 'avatar' })
  avatar: Media;
  @Column({ name: 'organisation' })
  organisation?: Organisation | undefined;
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

}
