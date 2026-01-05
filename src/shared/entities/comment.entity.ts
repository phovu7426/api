import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Comic } from './comic.entity';
import { Chapter } from './chapter.entity';
import { User } from './user.entity';

/**
 * Comment Entity
 * Bình luận (có thể comment trên comic hoặc chapter, hỗ trợ reply/reply của reply)
 */
@Entity('comments')
@Index('idx_user_id', ['user_id'])
@Index('idx_comic_id', ['comic_id'])
@Index('idx_chapter_id', ['chapter_id'])
@Index('idx_parent_id', ['parent_id'])
@Index('idx_status', ['status'])
@Index('idx_created_at', ['created_at'])
@Index('idx_comic_created', ['comic_id', 'created_at'])
@Index('idx_chapter_created', ['chapter_id', 'created_at'])
@Index('idx_created_user_id', ['created_user_id'])
@Index('idx_updated_user_id', ['updated_user_id'])
@Index('idx_deleted_at', ['deleted_at'])
export class Comment extends BaseEntity {
  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  chapter_id?: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_id?: number | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['visible', 'hidden'], default: 'visible' })
  status: 'visible' | 'hidden';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;

  @ManyToOne(() => Chapter, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies?: Comment[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_user_id' })
  created_user?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_user_id' })
  updated_user?: User | null;
}



