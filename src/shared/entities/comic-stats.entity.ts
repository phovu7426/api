import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Comic } from './comic.entity';

/**
 * ComicStats Entity
 * Tách riêng để tránh lock table comics khi cập nhật view/follow count
 */
@Entity('comic_stats')
@Index('idx_view_count', ['view_count'])
@Index('idx_follow_count', ['follow_count'])
@Index('idx_updated_at', ['updated_at'])
export class ComicStats {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  view_count: number;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  follow_count: number;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  rating_count: number;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  rating_sum: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;
}



