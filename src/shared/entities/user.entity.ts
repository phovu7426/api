import { Entity, Column, Index, OneToOne, OneToMany } from 'typeorm';
import { UserStatus } from '@/shared/enums/user-status.enum';
import { Profile } from './profile.entity';
import { UserGroup } from './user-group.entity';
import { UserRoleAssignment } from './user-role-assignment.entity';
import { BaseEntity } from './base.entity';

@Entity('users')
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class User extends BaseEntity {

  @Column({ length: 50, unique: true, nullable: true, type: 'varchar' })
  username?: string | null;

  @Column({ length: 255, unique: true, nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ length: 20, unique: true, nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  password?: string | null;

  @Column({ type: 'varchar', length: 255, default: UserStatus.Active })
  status: UserStatus;

  @Column({ type: 'datetime', nullable: true })
  email_verified_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  phone_verified_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  last_login_at?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  remember_token?: string | null;

  // ✅ Group-based relations
  @OneToMany(() => UserGroup, (ug) => ug.user)
  user_groups?: UserGroup[];

  @OneToMany(() => UserRoleAssignment, (ura) => ura.user)
  user_role_assignments?: UserRoleAssignment[];

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile?: Profile;
}
