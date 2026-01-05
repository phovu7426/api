import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Comic } from './comic.entity';
import { User } from './user.entity';

@Entity('comic_reviews')
@Index('idx_user_id', ['user_id'])
@Index('idx_comic_id', ['comic_id'])
@Unique('idx_user_comic', ['user_id', 'comic_id'])
@Index('idx_rating', ['rating'])
@Index('idx_created_at', ['created_at'])
@Index('idx_created_user_id', ['created_user_id'])
@Index('idx_updated_user_id', ['updated_user_id'])
@Index('idx_deleted_at', ['deleted_at'])
export class ComicReview extends BaseEntity {
  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'tinyint', unsigned: true })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_user_id' })
  created_user?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_user_id' })
  updated_user?: User | null;
}



