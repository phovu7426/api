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
import { User } from './user.entity';

/**
 * ComicFollow Entity
 * User follow/unfollow truyện
 */
@Entity('comic_follows')
@Index('idx_user_id', ['user_id'])
@Index('idx_comic_id', ['comic_id'])
@Unique('idx_user_comic', ['user_id', 'comic_id'])
@Index('idx_created_at', ['created_at'])
export class ComicFollow {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  comic_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Comic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comic_id' })
  comic?: Comic;
}



