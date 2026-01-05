import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { PostStatus, PostType } from '@/shared/enums';
import { BaseEntity } from './base.entity';

@Entity('posts')
@Index('idx_name', ['name'])
@Index('idx_slug', ['slug'])
@Index('idx_primary_postcategory_id', ['primary_postcategory_id'])
@Index('idx_status', ['status'])
@Index('idx_post_type', ['post_type'])
@Index('idx_is_featured', ['is_featured'])
@Index('idx_is_pinned', ['is_pinned'])
@Index('idx_published_at', ['published_at'])
@Index('idx_view_count', ['view_count'])
@Index('idx_created_at', ['created_at'])
@Index('idx_status_published_at', ['status', 'published_at'])
@Index('idx_is_featured_status', ['is_featured', 'status'])
@Index('idx_primary_category_status', ['primary_postcategory_id', 'status'])
@Index('idx_posts_group_id', ['group_id'])
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class Post extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image?: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  primary_postcategory_id?: number | null;

  @ManyToOne('PostCategory', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'primary_postcategory_id' })
  primary_category?: PostCategory | null;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.TEXT,
  })
  post_type: PostType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  video_url?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audio_url?: string | null;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'datetime', nullable: true })
  published_at?: Date | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  view_count: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  canonical_url?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_title?: string | null;

  @Column({ type: 'text', nullable: true })
  og_description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_image?: string | null;

  /**
   * Group/Context owner của post (shop, org, project...)
   * - Mặc định NULL → thuộc system/global content
   * - Khi chạy đa-tenant: luôn set theo group hiện tại
   */
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  group_id?: number | null;

  @ManyToMany('PostCategory', 'posts')
  @JoinTable({
    name: 'post_postcategory',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'postcategory_id', referencedColumnName: 'id' },
  })
  categories?: PostCategory[];

  @ManyToMany('PostTag', 'posts')
  @JoinTable({
    name: 'post_posttag',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'posttag_id', referencedColumnName: 'id' },
  })
  tags?: PostTag[];
}

