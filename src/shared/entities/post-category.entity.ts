import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Post } from '@/shared/entities/post.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('postcategory')
@Index('idx_name', ['name'])
@Index('idx_slug', ['slug'])
@Index('idx_parent_id', ['parent_id'])
@Index('idx_status', ['status'])
@Index('idx_sort_order', ['sort_order'])
@Index('idx_created_at', ['created_at'])
@Index('idx_status_sort_order', ['status', 'sort_order'])
@Index('idx_parent_status', ['parent_id', 'status'])
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class PostCategory extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_id?: number | null;

  @ManyToOne('PostCategory', 'children', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: PostCategory | null;

  @OneToMany('PostCategory', 'parent')
  children?: PostCategory[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string | null;

  @Column({
    type: 'enum',
    enum: BasicStatus,
    default: BasicStatus.Active,
  })
  status: BasicStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  canonical_url?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_image?: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @ManyToMany('Post', 'categories')
  posts?: Post[];
}

