import { Post, PostPlace } from '@bourgad-monorepo/model';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GeoJsonObject, Geometry } from 'geojson';
import { UserEntity } from '@bourgad-monorepo/api/user';
import { SubCategoryEntity } from '@bourgad-monorepo/api/category';
import { MediaEntity } from '@bourgad-monorepo/api/media';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';

@Entity('posts')
export class PostEntity implements Post {
    @PrimaryGeneratedColumn({ name: 'post_id' })
    postId: number;
    @Column({ name: 'title' })
    title: string;
    @Column({ name: 'content' })
    content: string;
    @Column({ name: 'user_id' })
    userId: number;
    @Column({ name: 'subcategory_id' })
    subcategoryId: number;
    @Column({ name: 'location', type: 'geometry', nullable: true })
    location?: PostPlace | undefined;
    @Column({ name: 'is_valid', default: false })
    isValid: boolean;
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    /** Associations */
    @ManyToOne(() => SubCategoryEntity, (subcategory) => subcategory.subcategoryId)
    @JoinColumn({ name: 'subcategory_id' })
    subcategory: SubCategoryEntity;
    @ManyToMany(() => MediaEntity)
    @JoinTable({ name: 'post_medias' })
    medias: MediaEntity[];
    @OneToMany(() => LikeEntity, (like) => like.postId)
    likes: LikeEntity[];
    @OneToMany(() => CommentEntity, (comment) => comment.postId)
    comments: CommentEntity[];
    @ManyToOne(() => UserEntity, (user) => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}