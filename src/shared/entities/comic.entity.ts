import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Group } from './group.entity';
import { ComicStatus } from '@/shared/enums';

@Entity('comics')
@Index('idx_slug', ['slug'])
@Index('idx_status', ['status'])
@Index('idx_author', ['author'])
@Index('idx_created_at', ['created_at'])
@Index('idx_created_user_id', ['created_user_id'])
@Index('idx_updated_user_id', ['updated_user_id'])
@Index('idx_deleted_at', ['deleted_at'])
export class Comic extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author?: string | null;

  @Column({
    type: 'enum',
    enum: ComicStatus,
    default: ComicStatus.DRAFT,
  })
  status: ComicStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_user_id' })
  created_user?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_user_id' })
  updated_user?: User | null;

  // Relations
  @OneToOne('ComicStats', 'comic')
  stats?: any;

  @OneToMany('Chapter', 'comic')
  chapters?: any[];

  @OneToMany('ComicReview', 'comic')
  reviews?: any[];

  @OneToMany('Comment', 'comic')
  comments?: any[];

  @OneToMany('ComicFollow', 'comic')
  follows?: any[];

  @OneToMany('ReadingHistory', 'comic')
  reading_histories?: any[];

  @OneToMany('ComicView', 'comic')
  views?: any[];

  @ManyToMany('ComicCategory', 'comics')
  @JoinTable({
    name: 'comic_category',
    joinColumn: { name: 'comic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comic_category_id', referencedColumnName: 'id' },
  })
  categories?: any[];
}

