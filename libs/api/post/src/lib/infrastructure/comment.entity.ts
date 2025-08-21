import { Comment } from '@bourgad-monorepo/model';
import { AuditableSchema } from '@bourgad-monorepo/api/core';
import { EntitySchema } from 'typeorm';

export const CommentEntity = new EntitySchema<Comment>({
    name: 'CommentEntity',
    tableName: 'comments',
    columns: {
        ...AuditableSchema,
        commentId: {
            type: Number,
            primary: true,
            generated: true,
            name: 'comment_id',
        },
        postId: {
            type: Number,
            name: 'post_id',
        },
        userId: {
            type: Number,
            name: 'user_id',
        },
        content: {
            type: String,
            name: 'content',
        }
    },
    relations: {
        post: {
            type: 'many-to-one',
            target: 'PostEntity',
            joinColumn: { name: 'post_id' },
            inverseSide: 'comments',
        },
        user: {
            type: 'many-to-one',
            target: 'UserEntity',
            joinColumn: { name: 'user_id' },
            inverseSide: 'comments',
        },
    },
});