import { Geometry } from "geojson";
import { Department } from "./department.model";

export interface City {
    cityId: string;
    name: string;
    population: number;
    postalCodes: string[];
    surface: Geometry;
    department: Department;
}