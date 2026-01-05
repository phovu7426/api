import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Chapter } from './chapter.entity';
import { User } from './user.entity';

/**
 * Bookmark Entity
 * Đánh dấu trang (bookmark) của user
 */
@Entity('bookmarks')
@Index('idx_user_id', ['user_id'])
@Index('idx_chapter_id', ['chapter_id'])
@Index('idx_user_chapter', ['user_id', 'chapter_id'])
@Index('idx_created_at', ['created_at'])
export class Bookmark {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  chapter_id: number;

  @Column({ type: 'int' })
  page_number: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter;
}



