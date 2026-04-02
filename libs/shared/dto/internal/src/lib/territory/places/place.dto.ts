import { Point } from "geojson";

export class PlaceAutocompleteDto {
  id: number;
  name: string;
  category: string;
  lat: number | null;
  lng: number | null;
  point: Point | null;
}
