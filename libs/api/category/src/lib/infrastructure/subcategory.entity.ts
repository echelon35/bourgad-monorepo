import { Subcategory } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const SubCategoryEntity = new EntitySchema<Subcategory>({
  name: 'SubCategoryEntity',
  tableName: 'subcategories',
  columns: {
    subcategoryId: { type: Number, primary: true, name: 'subcategory_id' },
    categoryId: { type: Number, name: 'category_id' },
    name: { type: String, name: 'name' },
    description: { type: String, name: 'description', nullable: true },
    tagClass: { type: String, name: 'tag_class', nullable: true },
    iconUrl: { type: String, name: 'icon_url', nullable: true },
  },
  relations: {
    category: { type: 'many-to-one', target: 'CategoryEntity', joinColumn: { name: 'category_id' }, inverseSide: 'subcategories' },
  },
});
