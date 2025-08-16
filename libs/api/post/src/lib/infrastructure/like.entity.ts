import { UserEntity } from "@bourgad-monorepo/api/user";
import { Like } from "@bourgad-monorepo/model";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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
    @OneToMany(() => PostEntity, (post) => post.postId)
    @JoinColumn({ name: 'post_id' })
    post: PostEntity;
    @OneToOne(() => UserEntity, (user) => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}