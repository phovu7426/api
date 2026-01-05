import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Context } from './context.entity';

@Entity('role_contexts')
@Index(['role_id'])
@Index(['context_id'])
export class RoleContext {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  role_id: number;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  context_id: number;

  @ManyToOne(() => Role, (role) => role.role_contexts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ManyToOne(() => Context, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'context_id' })
  context?: Context;
}

