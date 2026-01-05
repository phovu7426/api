import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { Context } from '@/shared/entities/context.entity';
import { RoleContext } from '@/shared/entities/role-context.entity';
import { Group } from '@/shared/entities/group.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { UserRoleAssignment } from '@/shared/entities/user-role-assignment.entity';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

/**
 * Service quản lý RBAC (Role-Based Access Control)
 * Bao gồm: kiểm tra quyền/vai trò của user và quản lý roles cho user
 */
@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) protected readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) protected readonly permRepo: Repository<Permission>,
    @InjectRepository(User) protected readonly userRepo: Repository<User>,
    @InjectRepository(Context) protected readonly contextRepo: Repository<Context>,
    @InjectRepository(Group) protected readonly groupRepo: Repository<Group>,
    @InjectRepository(UserGroup) protected readonly userGroupRepo: Repository<UserGroup>,
    @InjectRepository(UserRoleAssignment) protected readonly userRoleAssignmentRepo: Repository<UserRoleAssignment>,
    private readonly rbacCache: RbacCacheService,
  ) { }


  /**
   * Kiểm tra user có permissions trong group cụ thể
   * @param userId - ID của user
   * @param groupId - ID của group (có thể null cho system-level)
   * @param required - Mảng permissions cần check (OR logic)
   */
  async userHasPermissionsInGroup(
    userId: number,
    groupId: number | null,
    required: string[],
  ): Promise<boolean> {
    // Nếu không cần quyền trong group (system-level)
    if (groupId === null) {
      // Check system-level permissions (nếu có)
      return this.checkSystemPermissions(userId, required);
    }

    // Check user thuộc group
    const userInGroup = await this.userGroupRepo.findOne({
      where: { user_id: userId, group_id: groupId },
    });

    if (!userInGroup) {
      return false; // User không thuộc group → DENY
    }

    // Try cache first
    let cached = await this.rbacCache.getUserPermissionsInGroup(userId, groupId);
    if (!cached) {
      // Query permissions từ user_role_assignments
      const rows = await this.userRoleAssignmentRepo
        .createQueryBuilder('ura')
        .select(['perm.code AS code'])
        .innerJoin('ura.role', 'role', 'role.status = :rstatus', { rstatus: 'active' })
        .innerJoin('role.permissions', 'perm', 'perm.status = :pstatus', { pstatus: 'active' })
        .leftJoin('perm.parent', 'parent')
        .where('ura.user_id = :userId', { userId })
        .andWhere('ura.group_id = :groupId', { groupId })
        .getRawMany<{ code: string; parent: string | null }>();

      const set = new Set<string>();
      for (const r of rows) {
        if (r.code) set.add(r.code);
        if (r.parent) set.add(r.parent);
      }

      await this.rbacCache.setUserPermissionsInGroup(userId, groupId, set);
      cached = set;
    }

    // OR logic: chỉ cần 1 permission
    for (const need of required) {
      if (cached.has(need)) return true;
    }

    return false;
  }

  /**
   * Check system-level permissions (khi groupId = null)
   * Query trực tiếp system group
   */
  private async checkSystemPermissions(
    userId: number,
    required: string[],
  ): Promise<boolean> {
    // Query từ system group
    const systemAdminGroup = await this.groupRepo.findOne({
      where: { code: 'system', status: 'active' },
    });

    if (!systemAdminGroup) {
      return false; // Không có system group → không có system permissions
    }

    // Check user thuộc system group
    const userInGroup = await this.userGroupRepo.findOne({
      where: { user_id: userId, group_id: systemAdminGroup.id },
    });

    if (!userInGroup) {
      return false; // User không thuộc system group → không có system permissions
    }

    // Query permissions từ user_role_assignments
    const rows = await this.userRoleAssignmentRepo
      .createQueryBuilder('ura')
      .select(['perm.code AS code'])
      .innerJoin('ura.role', 'role', 'role.status = :rstatus', { rstatus: 'active' })
      .innerJoin('role.permissions', 'perm', 'perm.status = :pstatus', { pstatus: 'active' })
      .leftJoin('perm.parent', 'parent')
      .where('ura.user_id = :userId', { userId })
      .andWhere('ura.group_id = :groupId', { groupId: systemAdminGroup.id })
      .getRawMany<{ code: string; parent: string | null }>();

    const set = new Set<string>();
    for (const r of rows) {
      if (r.code) set.add(r.code);
      if (r.parent) set.add(r.parent);
    }

    // OR logic: chỉ cần 1 permission
    for (const need of required) {
      if (set.has(need)) return true;
    }
    return false;
  }

  /**
   * Gán role cho user trong group
   */
  async assignRoleToUser(
    userId: number,
    roleId: number,
    groupId: number,
  ): Promise<void> {
    // Validate: User phải thuộc group
    const userInGroup = await this.userGroupRepo.findOne({
      where: { user_id: userId, group_id: groupId },
    });

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning role',
      );
    }

    // Validate: Role được phép trong context của group
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['context'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const roleContext = await this.groupRepo.manager.getRepository(RoleContext).findOne({
      where: { role_id: roleId, context_id: group.context_id },
    });

    if (!roleContext) {
      throw new BadRequestException(
        'Role is not allowed in this context',
      );
    }

    // Check if assignment already exists
    const existing = await this.userRoleAssignmentRepo.findOne({
      where: { user_id: userId, role_id: roleId, group_id: groupId },
    });

    if (existing) {
      return; // Already assigned
    }

    // Insert
    const assignment = this.userRoleAssignmentRepo.create({
      user_id: userId,
      role_id: roleId,
      group_id: groupId,
    });

    await this.userRoleAssignmentRepo.save(assignment);

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(userId, groupId);
  }

  /**
   * Sync roles cho user trong group (thay thế toàn bộ roles hiện tại trong group)
   * @param userId - ID của user
   * @param groupId - ID của group
   * @param roleIds - Mảng role IDs cần gán cho user (nếu rỗng thì xóa hết roles)
   * @param skipValidation - Bỏ qua validation (chỉ dùng cho system admin)
   */
  async syncRolesInGroup(
    userId: number,
    groupId: number,
    roleIds: number[],
    skipValidation: boolean = false,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['context'],
    });
    if (!group) throw new NotFoundException('Group not found');

    // Validate: User phải thuộc group
    const userInGroup = await this.userGroupRepo.findOne({
      where: { user_id: userId, group_id: groupId },
    });

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning roles',
      );
    }

    // Validate và fetch roles
    let roles: Role[] = [];
    if (roleIds.length > 0) {
      roles = await this.roleRepo.findBy({ id: In(roleIds) });
      
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      // Validate roles nếu không phải system admin
      if (!skipValidation) {
        // Kiểm tra roles phải có context của group trong role_contexts
        const roleContextRepo = this.roleRepo.manager.getRepository(RoleContext);
        const roleContexts = await roleContextRepo.find({
          where: {
            role_id: In(roleIds),
            context_id: group.context_id,
          } as any,
        });

        const validRoleIds = new Set(roleContexts.map(rc => rc.role_id));
        const invalidRoles = roles.filter(role => !validRoleIds.has(role.id));

        if (invalidRoles.length > 0) {
          throw new BadRequestException(
            `Cannot assign roles that are not available in this context. Invalid roles: ${invalidRoles.map(r => r.code).join(', ')}`
          );
        }
      }
    }

    // Xóa tất cả roles cũ trong group này
    await this.userRoleAssignmentRepo.delete({ user_id: userId, group_id: groupId });

    // Thêm roles mới
    if (roles.length > 0) {
      for (const role of roles) {
        await this.assignRoleToUser(userId, role.id, groupId);
      }
    }

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(userId, groupId);
  }

}

