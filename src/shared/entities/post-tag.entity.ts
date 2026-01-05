import {
  Entity,
  Column,
  ManyToMany,
  Index,
} from 'typeorm';
import { Post } from '@/shared/entities/post.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BaseEntity } from './base.entity';

@Entity('posttag')
@Index('idx_name', ['name'])
@Index('idx_slug', ['slug'])
@Index('idx_status', ['status'])
@Index('idx_created_at', ['created_at'])
@Index('idx_status_created_at', ['status', 'created_at'])
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class PostTag extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

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

  @ManyToMany('Post', 'tags')
  posts?: Post[];
}

