import { UserEntity } from "@bourgad-monorepo/api/user";
import { Like } from "@bourgad-monorepo/model";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity('likes')
export class LikeEntity implements Like {
    @PrimaryGeneratedColumn({name: 'like_id'})
    likeId: number;
    @Column({name: 'user_id'})
    userId: number;
    @Column({name: 'post_id'})
    postId: number;

    /** Associations */
    @ManyToOne(() => PostEntity, (post) => post.postId)
    @JoinColumn({ name: 'post_id' })
    post: PostEntity;
    @ManyToOne(() => UserEntity, (user) => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}