import { Geometry } from "geojson";

export interface Location {
    locationId: string;
    name: string;
    label: string;
    providerId?: string;
    state?: string;
    department?: string;
    country?: string;
    //Country code is two letters used for picture
    countryCode?: string;
    point: Geometry;
}