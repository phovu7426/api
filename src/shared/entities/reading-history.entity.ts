import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Comic } from './comic.entity';
import { Chapter } from './chapter.entity';
import { User } from './user.entity';

/**
 * ReadingHistory Entity
 * Lịch sử đọc của user
 */
@Entity('reading_histories')
@Index('idx_user_id', ['user_id'])
@Index('idx_comic_id', ['comic_id'])
@Unique('idx_user_comic', ['user_id', 'comic_id'])
@Index('idx_chapter_id', ['chapter_id'])
@Index('idx_updated_at', ['updated_at'])
export class ReadingHistory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'bigint', unsigned: true })
  chapter_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter;
}



