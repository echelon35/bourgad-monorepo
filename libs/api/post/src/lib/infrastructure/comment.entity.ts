import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./post.entity";
import { UserEntity } from "@bourgad-monorepo/api/user";
import { Comment } from "@bourgad-monorepo/model";

@Entity('comments')
export class CommentEntity implements Comment {
    @PrimaryGeneratedColumn({ name: 'comment_id' })
    commentId: number;
    @Column({ name: 'post_id' })
    postId: number;
    @Column({ name: 'user_id' })
    userId: number;
    @Column({ name: 'content' })
    content: string;
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    /** Associations */
    @OneToMany(() => PostEntity, (post) => post.postId)
    @JoinColumn({ name: 'post_id' })
    post: PostEntity;
    @OneToOne(() => UserEntity, (user) => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}