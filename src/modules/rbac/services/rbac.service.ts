import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

/**
 * Service quản lý RBAC (Role-Based Access Control)
 * Bao gồm: kiểm tra quyền/vai trò của user và quản lý roles cho user
 */
@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
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
    const userInGroup = await this.prisma.userGroup.findFirst({
      where: { 
        user_id: BigInt(userId), 
        group_id: BigInt(groupId) 
      },
    });

    if (!userInGroup) {
      return false; // User không thuộc group → DENY
    }

    // Try cache first
    let cached = await this.rbacCache.getUserPermissionsInGroup(userId, groupId);
    if (!cached) {
      // Query permissions từ user_role_assignments
      const rows = await this.prisma.userRoleAssignment.findMany({
        where: {
          user_id: BigInt(userId),
          group_id: BigInt(groupId),
          role: {
            status: 'active',
            permissions: {
              some: {
                status: 'active',
              },
            },
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                where: {
                  status: 'active',
                },
                include: {
                  parent: true,
                },
              },
            },
          },
        },
      });

      const set = new Set<string>();
      for (const assignment of rows) {
        for (const perm of assignment.role.permissions) {
          if (perm.code) set.add(perm.code);
          if (perm.parent?.code) set.add(perm.parent.code);
        }
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
    const systemAdminGroup = await this.prisma.group.findFirst({
      where: { code: 'system', status: 'active' },
    });

    if (!systemAdminGroup) {
      return false; // Không có system group → không có system permissions
    }

    // Check user thuộc system group
    const userInGroup = await this.prisma.userGroup.findFirst({
      where: { 
        user_id: BigInt(userId), 
        group_id: systemAdminGroup.id 
      },
    });

    if (!userInGroup) {
      return false; // User không thuộc system group → không có system permissions
    }

    // Query permissions từ user_role_assignments
    const rows = await this.prisma.userRoleAssignment.findMany({
      where: {
        user_id: BigInt(userId),
        group_id: systemAdminGroup.id,
        role: {
          status: 'active',
          permissions: {
            some: {
              status: 'active',
            },
          },
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                status: 'active',
              },
              include: {
                parent: true,
              },
            },
          },
        },
      },
    });

    const set = new Set<string>();
    for (const assignment of rows) {
      for (const perm of assignment.role.permissions) {
        if (perm.code) set.add(perm.code);
        if (perm.parent?.code) set.add(perm.parent.code);
      }
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
    const userInGroup = await this.prisma.userGroup.findFirst({
      where: { 
        user_id: BigInt(userId), 
        group_id: BigInt(groupId) 
      },
    });

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning role',
      );
    }

    // Validate: Role được phép trong context của group
    const group = await this.prisma.group.findUnique({
      where: { id: BigInt(groupId) },
      include: {
        context: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const roleContext = await this.prisma.roleContext.findFirst({
      where: { 
        role_id: BigInt(roleId), 
        context_id: group.context_id 
      },
    });

    if (!roleContext) {
      throw new BadRequestException(
        'Role is not allowed in this context',
      );
    }

    // Check if assignment already exists
    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: { 
        user_id: BigInt(userId), 
        role_id: BigInt(roleId), 
        group_id: BigInt(groupId) 
      },
    });

    if (existing) {
      return; // Already assigned
    }

    // Insert
    await this.prisma.userRoleAssignment.create({
      data: {
        user_id: BigInt(userId),
        role_id: BigInt(roleId),
        group_id: BigInt(groupId),
      },
    });

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
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new NotFoundException('User not found');

    const group = await this.prisma.group.findUnique({
      where: { id: BigInt(groupId) },
      include: {
        context: true,
      },
    });
    if (!group) throw new NotFoundException('Group not found');

    // Validate: User phải thuộc group
    const userInGroup = await this.prisma.userGroup.findFirst({
      where: { 
        user_id: BigInt(userId), 
        group_id: BigInt(groupId) 
      },
    });

    if (!userInGroup) {
      throw new BadRequestException(
        'User must be a member of the group before assigning roles',
      );
    }

    // Validate và fetch roles
    let roles: any[] = [];
    if (roleIds.length > 0) {
      roles = await this.prisma.role.findMany({
        where: { 
          id: { 
            in: roleIds.map(id => BigInt(id)) 
          } 
        },
      });
      
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      // Validate roles nếu không phải system admin
      if (!skipValidation) {
        // Kiểm tra roles phải có context của group trong role_contexts
        const roleContexts = await this.prisma.roleContext.findMany({
          where: {
            role_id: { in: roleIds.map(id => BigInt(id)) },
            context_id: group.context_id,
          },
        });

        const validRoleIds = new Set(roleContexts.map((rc: any) => Number(rc.role_id)));
        const invalidRoles = roles.filter(role => !validRoleIds.has(Number(role.id)));

        if (invalidRoles.length > 0) {
          throw new BadRequestException(
            `Cannot assign roles that are not available in this context. Invalid roles: ${invalidRoles.map(r => r.code).join(', ')}`
          );
        }
      }
    }

    // Xóa tất cả roles cũ trong group này
    await this.prisma.userRoleAssignment.deleteMany({
      where: { 
        user_id: BigInt(userId), 
        group_id: BigInt(groupId) 
      },
    });

    // Thêm roles mới
    if (roles.length > 0) {
      for (const role of roles) {
        await this.assignRoleToUser(userId, Number(role.id), groupId);
      }
    }

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(userId, groupId);
  }

}
