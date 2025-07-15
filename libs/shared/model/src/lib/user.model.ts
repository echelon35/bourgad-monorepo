import { Audited } from "./audited.model";
import { City } from "./city.model";
import { Media } from "./media.model";
import { Role } from "./role.model";
import { Organisation } from "./organisation.model";

export interface User extends Audited {
  userId: number;
  firstname: string;
  lastname: string;
  mail: string;
  password: string;
  phone?: string;
  typeUtilisateur: string;
  registerDate: Date;
  presscardNumber?: string;
  avatarId: number;
  cityId: number;
  title: string;

  verifiedMail: boolean;
  cguAccepted: boolean;
  newsletterAccepted: boolean;

  // Register by other provider
  provider: string;
  providerId: string;

  city: City;
  avatar: Media;
  organisation?: Organisation;
  roles: Role[];
}