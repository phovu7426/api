import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Comic } from './comic.entity';
import { Chapter } from './chapter.entity';
import { User } from './user.entity';

/**
 * ComicView Entity
 * Log view của comic/chapter (dùng để aggregate vào comic_stats)
 */
@Entity('comic_views')
@Index('idx_comic_id', ['comic_id'])
@Index('idx_chapter_id', ['chapter_id'])
@Index('idx_user_id', ['user_id'])
@Index('idx_created_at', ['created_at'])
@Index('idx_comic_created', ['comic_id', 'created_at'])
@Index('idx_chapter_created', ['chapter_id', 'created_at'])
export class ComicView {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  chapter_id?: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id?: number | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;

  @ManyToOne(() => Chapter, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;
}



