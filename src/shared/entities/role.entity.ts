import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RoleContext } from './role-context.entity';
import { BaseEntity } from './base.entity';

@Entity('roles')
@Index(['code'], { unique: true })
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class Role extends BaseEntity {

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ type: 'bigint', nullable: true })
  parent_id?: number | null;

  @ManyToOne(() => Role, (role) => role.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Role | null;

  @OneToMany(() => Role, (role) => role.parent)
  children?: Role[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: false })
  @JoinTable({
    name: 'role_has_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @OneToMany(() => RoleContext, (roleContext) => roleContext.role)
  role_contexts?: RoleContext[];
}
