import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';

@Entity('contexts')
@Index(['type', 'ref_id'], { unique: true })
@Index('idx_deleted_at', ['deleted_at'])
export class Context extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  type: string; // 'system' | 'shop' | 'group' | 'project' | ...

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  ref_id?: number | null; // NULL cho system, ID của shop/group/project cho các context khác

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  // Relations
  // Note: ref_id có thể reference đến nhiều loại entities (Group, hoặc entities khác)
  // Không dùng foreign key trực tiếp, chỉ query khi cần

  // ✅ Relation với groups (1 context → N groups)
  @OneToMany(() => Group, (group) => group.context)
  groups?: Group[];
}

