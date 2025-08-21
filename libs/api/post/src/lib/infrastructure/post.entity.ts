import { Post } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';
import { AuditableSchema } from '@bourgad-monorepo/api/core';

export const PostEntity = new EntitySchema<Post>({
    name: 'PostEntity',
    tableName: 'posts',
    columns: {
        ...AuditableSchema,
        postId: {
            type: Number,
            primary: true,
            generated: true,
            name: 'post_id',
        },
        title: {
            type: String,
            name: 'title',
        },
        content: {
            type: String,
            name: 'content',
        },
        userId: {
            type: Number,
            name: 'user_id',
        },
        subcategoryId: {
            type: Number,
            name: 'subcategory_id',
        },
        locationId: {
            type: Number,
            name: 'location_id',
            nullable: true,
        },
        isValid: {
            type: Boolean,
            name: 'is_valid',
            default: false,
        }
    },
    relations: {
        subcategory: { type: 'many-to-one', target: 'SubCategoryEntity', inverseSide: 'posts', joinColumn: { name: 'subcategory_id' } },
        user: { type: 'many-to-one', target: 'UserEntity', inverseSide: 'posts', joinColumn: { name: 'user_id' } },
        location: { type: 'many-to-one', target: 'LocationEntity', inverseSide: 'posts', joinColumn: { name: 'location_id' } },
        medias: { type: 'many-to-many', target: 'MediaEntity', inverseSide: 'posts', joinTable: { name: 'post_medias', joinColumn: { name: 'post_id' }, inverseJoinColumn: { name: 'media_id' } } },
        likes: { type: 'one-to-many', target: 'LikeEntity', inverseSide: 'post', joinColumn: { name: 'post_id' } },
        comments: { type: 'one-to-many', target: 'CommentEntity', inverseSide: 'post', joinColumn: { name: 'post_id' } },
    }
});