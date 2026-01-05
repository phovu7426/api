import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Context } from './context.entity';
import { UserGroup } from './user-group.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';

/**
 * Groups Entity - Tổng quát cho shop, team, project, department, v.v.
 * 
 * Type examples:
 * - 'shop': Cửa hàng
 * - 'team': Nhóm làm việc
 * - 'project': Dự án
 * - 'department': Phòng ban
 * - 'organization': Tổ chức
 */
@Entity('groups')
@Index(['type', 'code'], { unique: true })
@Index('idx_deleted_at', ['deleted_at'])
@Index('IDX_groups_context_id', ['context_id'])
export class Group extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  type: string; // 'shop' | 'team' | 'project' | 'department' | 'organization' | ...

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // Unique code: shop-001, team-dev, project-abc, ...

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  owner_id?: number | null; // Owner/creator của group

  // ✅ MỚI: Thêm context_id
  @Column({ type: 'bigint', unsigned: true })
  context_id: number;

  @ManyToOne(() => Context, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'context_id' })
  context?: Context;

  // ✅ MỚI: Relations
  @OneToMany(() => UserGroup, (ug) => ug.group)
  user_groups?: UserGroup[];

  @OneToMany(() => UserRoleAssignment, (ura) => ura.group)
  user_role_assignments?: UserRoleAssignment[];

  // Additional fields có thể mở rộng theo type
  @Column({ type: 'json', nullable: true })
  metadata?: any | null; // Lưu thông tin bổ sung theo type (ví dụ: shop có address, team có members, ...)
}

