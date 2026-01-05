import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Comic } from './comic.entity';
import { Group } from './group.entity';
import { User } from './user.entity';
import { ChapterStatus } from '@/shared/enums';

@Entity('chapters')
@Index('idx_comic_id', ['comic_id'])
@Index('idx_comic_chapter_index', ['comic_id', 'chapter_index'])
@Unique('idx_comic_chapter_unique', ['comic_id', 'chapter_index'])
@Index('idx_team_id', ['team_id'])
@Index('idx_status', ['status'])
@Index('idx_view_count', ['view_count'])
@Index('idx_created_at', ['created_at'])
@Index('idx_created_user_id', ['created_user_id'])
@Index('idx_updated_user_id', ['updated_user_id'])
@Index('idx_deleted_at', ['deleted_at'])
export class Chapter extends BaseEntity {
  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  team_id?: number | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  chapter_index: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  chapter_label?: string | null;

  @Column({
    type: 'enum',
    enum: ChapterStatus,
    default: ChapterStatus.DRAFT,
  })
  status: ChapterStatus;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  view_count: number;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;

  @ManyToOne(() => Group, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team?: Group | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_user_id' })
  created_user?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_user_id' })
  updated_user?: User | null;

  // Relations
  @OneToMany('ChapterPage', 'chapter')
  pages?: any[];

  @OneToMany('ReadingHistory', 'chapter')
  reading_histories?: any[];

  @OneToMany('Comment', 'chapter')
  comments?: any[];

  @OneToMany('Bookmark', 'chapter')
  bookmarks?: any[];

  @OneToMany('ComicView', 'chapter')
  views?: any[];
}

