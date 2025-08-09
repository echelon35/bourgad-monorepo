import {Media} from '@bourgad-monorepo/model';

export class GetProfileDto {
    firstname: string;
    lastname: string;
    avatarUrl: Media;
}