export class GetProfileDto {
    firstname: string;
    lastname: string;
    mail: string;
    phone?: string;
    avatarUrl?: string;
    avatarMediaId?: number;
    cityId?: string;
}