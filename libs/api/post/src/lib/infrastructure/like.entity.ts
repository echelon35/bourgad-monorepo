import { Like } from '@bourgad-monorepo/model';
import { EntitySchema } from 'typeorm';

export const LikeEntity = new EntitySchema<Like>({
    name: 'LikeEntity',
    tableName: 'likes',
    columns: {
        likeId: {
            type: Number,
            primary: true,
            generated: true,
            name: 'like_id',
        },
        userId: {
            type: Number,
            name: 'user_id',
        },
        postId: {
            type: Number,
            name: 'post_id',
        },
    },
    relations: {
        user: { type: 'many-to-one', target: 'UserEntity', inverseSide: 'likes' },
        post: { type: 'many-to-one', target: 'PostEntity', inverseSide: 'likes' }
    }
})