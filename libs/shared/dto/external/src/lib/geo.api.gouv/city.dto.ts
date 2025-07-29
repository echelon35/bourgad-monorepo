import { Geometry } from "geojson";

export class CityDto {
  properties: CityProperties;
  geometry: Geometry;
}

class CityProperties {
  code: string;
  nom: string;
  population: number;
  codesPostaux: string[];
}