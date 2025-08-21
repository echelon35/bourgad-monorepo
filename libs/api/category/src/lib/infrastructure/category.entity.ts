import { Category } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const CategoryEntity = new EntitySchema<Category>({
  name: 'CategoryEntity',
  tableName: 'categories',
  columns: {
    categoryId: { type: Number, primary: true, name: 'category_id' },
    name: { type: String, name: 'name' },
    description: { type: String, name: 'description', nullable: true },
    tagClass: { type: String, name: 'tag_class', nullable: true },
    iconUrl: { type: String, name: 'icon_url', nullable: true },
    backgroundUrl: { type: String, name: 'background_url', nullable: true },
  },
});
