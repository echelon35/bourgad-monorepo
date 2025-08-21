import { Point } from "geojson";

export class CreateLocationDto {
    name: string;
    label: string;
    providerId?: string;
    state?: string;
    department?: string;
    country?: string;
    countryCode?: string;
    point?: Point;
}