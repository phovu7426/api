import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('user_groups')
@Index(['user_id'])
@Index(['group_id'])
export class UserGroup {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  user_id: number;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  group_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group?: Group;
}


