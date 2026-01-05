import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('permissions')
@Index(['code'], { unique: true })
@Index(['scope'])
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class Permission extends BaseEntity {

  @Column({ type: 'varchar', length: 120 })
  code: string;

  @Column({ type: 'varchar', length: 30, default: 'context' })
  scope: string; // 'system' | 'context'

  @Column({ type: 'varchar', length: 150, nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ type: 'bigint', nullable: true })
  parent_id?: number | null;

  @ManyToOne(() => Permission, (perm) => perm.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Permission | null;

  @OneToMany(() => Permission, (perm) => perm.parent)
  children?: Permission[];

  @ManyToMany(() => Role, (role) => role.permissions, { cascade: false })
  roles?: Role[];
}
