import { Audited } from "./audited.model";
import { City } from "./city.model";
import { Media } from "./media.model";
import { Role } from "./role.model";
import { Organisation } from "./organisation.model";

export interface User extends Audited {
  userId: number;
  name: string;
  firstname: string;
  lastname: string;
  displayname: string;
  mail: string;
  password: string;
  phone?: string;
  typeUtilisateur: string;
  registerDate: Date;
  presscardNumber?: string;
  avatarId: number;
  cityId: number;
  title: string;
  roleId: Role;

  city: City;
  avatar: Media;
  organisation?: Organisation;
}