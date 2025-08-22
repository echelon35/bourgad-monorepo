export interface GoogleLoginDto {
  mail: string;
  firstname: string;
  lastname: string;
  username: string;
  accessToken: string;
  providerId: string;
  avatar: string;
  provider: 'GOOGLE';
  last_connexion: Date;
}
