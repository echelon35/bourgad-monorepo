import { Category } from "./category.model";

export interface Subcategory {
    subcategoryId: number;
    name: string;
    description?: string;
    categoryId: number;
    tagClass?: string;
    iconUrl: string;
    markerIconUrl: string;

    category: Category;
}