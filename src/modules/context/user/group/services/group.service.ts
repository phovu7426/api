import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

@Injectable()
export class UserGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
    private readonly rbacCache: RbacCacheService,
  ) {}

  /**
   * Kiểm tra user có phải owner của group không
   */
  async isOwner(groupId: number, userId: number): Promise<boolean> {
    const group = await this.prisma.group.findFirst({
      where: { id: BigInt(groupId), status: 'active', deleted_at: null },
    });
    if (!group) return false;
    return group.owner_id ? Number(group.owner_id) === userId : false;
  }

  /**
   * Kiểm tra user có quyền quản lý group không (owner hoặc có permission group.manage)
   */
  async canManageGroup(groupId: number, userId: number): Promise<boolean> {
    const group = await this.prisma.group.findFirst({
      where: { id: BigInt(groupId), status: 'active', deleted_at: null },
    });
    if (!group) return false;

    // Owner luôn có quyền
    if (group.owner_id && Number(group.owner_id) === userId) return true;

    // Check permission trong group trực tiếp
    return this.rbacService.userHasPermissionsInGroup(userId, groupId, [
      'group.manage',
      'group.member.add',
      'group.member.manage',
    ]);
  }

  /**
   * Lấy context của group
   */
  async getGroupContext(groupId: number): Promise<any | null> {
    const group = await this.prisma.group.findFirst({
      where: { id: BigInt(groupId), status: 'active', deleted_at: null },
      include: {
        context: true,
      },
    });
    if (!group || !group.context) return null;
    
    return {
      ...group.context,
      id: Number(group.context.id),
      ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
    };
  }

  /**
   * Thêm member vào group (owner hoặc có permission)
   */
  async addMember(
    groupId: number,
    memberUserId: number,
    roleIds: number[],
    requesterUserId: number,
  ): Promise<void> {
    // Check quyền
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to add members to this group');
    }

    const group = await this.prisma.group.findFirst({
      where: { id: BigInt(groupId), status: 'active', deleted_at: null },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const member = await this.prisma.user.findUnique({ where: { id: BigInt(memberUserId) } });
    if (!member) {
      throw new NotFoundException('Member user not found');
    }

    // Thêm user vào user_groups (nếu chưa có)
    const existingUserGroup = await this.prisma.userGroup.findFirst({
      where: { user_id: BigInt(memberUserId), group_id: BigInt(groupId) },
    });

    if (!existingUserGroup) {
      await this.prisma.userGroup.create({
        data: {
          user_id: BigInt(memberUserId),
          group_id: BigInt(groupId),
          joined_at: new Date(),
        },
      });
    }

    // Gán roles qua user_role_assignments
    if (roleIds.length > 0) {
      // Validate roles
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds.map(id => BigInt(id)) } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      // Xóa roles cũ trong group này
      await this.prisma.userRoleAssignment.deleteMany({
        where: {
          user_id: BigInt(memberUserId),
          group_id: BigInt(groupId),
        },
      });

      // Thêm roles mới
      for (const roleId of roleIds) {
        await this.rbacService.assignRoleToUser(memberUserId, roleId, groupId);
      }
    } else {
      // Nếu không có roles, xóa tất cả roles trong group
      await this.prisma.userRoleAssignment.deleteMany({
        where: {
          user_id: BigInt(memberUserId),
          group_id: BigInt(groupId),
        },
      });
    }
  }

  /**
   * Gán roles cho member trong group (owner hoặc user có permission trong context)
   */
  async assignRolesToMember(
    groupId: number,
    memberUserId: number,
    roleIds: number[],
    requesterUserId: number,
  ): Promise<void> {
    // Check quyền
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to manage roles in this group');
    }

    // Đảm bảo user đã thuộc group
    const existingUserGroup = await this.prisma.userGroup.findFirst({
      where: { user_id: BigInt(memberUserId), group_id: BigInt(groupId) },
    });

    if (!existingUserGroup) {
      throw new BadRequestException('User must be a member of the group before assigning roles');
    }

    // Xóa roles cũ trong group
    await this.prisma.userRoleAssignment.deleteMany({
      where: {
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
      },
    });

    // Thêm roles mới
    if (roleIds.length > 0) {
      // Validate roles
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds.map(id => BigInt(id)) } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      for (const roleId of roleIds) {
        await this.rbacService.assignRoleToUser(memberUserId, roleId, groupId);
      }
    }

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(memberUserId, groupId);
  }

  /**
   * Xóa member khỏi group (owner hoặc user có permission trong context)
   */
  async removeMember(
    groupId: number,
    memberUserId: number,
    requesterUserId: number,
  ): Promise<void> {
    // Check quyền
    const canManage = await this.canManageGroup(groupId, requesterUserId);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to remove members from this group');
    }

    const group = await this.prisma.group.findFirst({
      where: { id: BigInt(groupId), status: 'active', deleted_at: null },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Không cho phép xóa owner
    if (group.owner_id && Number(group.owner_id) === memberUserId) {
      throw new BadRequestException('Cannot remove owner from group');
    }

    // Xóa user khỏi user_groups
    await this.prisma.userGroup.deleteMany({
      where: {
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
      },
    });

    // Xóa tất cả roles của user trong group
    await this.prisma.userRoleAssignment.deleteMany({
      where: {
        user_id: BigInt(memberUserId),
        group_id: BigInt(groupId),
      },
    });

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(memberUserId, groupId);
  }

  /**
   * Lấy danh sách members của group (từ user_groups và user_role_assignments)
   */
  async getGroupMembers(groupId: number): Promise<any[]> {
    const members = await this.prisma.userRoleAssignment.findMany({
      where: { group_id: BigInt(groupId) },
      include: {
        user: true,
        role: true,
      },
    });

    return members.map(m => ({
      user_id: Number(m.user_id),
      user: m.user ? {
        id: Number(m.user.id),
        username: m.user.username,
        email: m.user.email,
      } : null,
      role_id: Number(m.role_id),
      role: m.role ? {
        id: Number(m.role.id),
        code: m.role.code,
        name: m.role.name,
      } : null,
    }));
  }

  /**
   * Lấy tất cả groups mà user hiện tại có thể truy cập
   * Kèm context info và roles của user trong mỗi group
   */
  async getUserGroups(userId: number): Promise<any[]> {
    // Lấy tất cả groups mà user là member (từ user_groups)
    const userGroups = await this.prisma.userGroup.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        group: {
          include: {
            context: true,
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    // Xử lý từng group để lấy roles
    const result = await Promise.all(
      userGroups.map(async (ug) => {
        const group = ug.group;

        // Kiểm tra group có tồn tại không
        if (!group) {
          return null;
        }

        // Chỉ lấy groups active
        if (group.status !== 'active' || group.deleted_at) {
          return null;
        }

        // Lấy roles của user trong group này
        const roleAssignments = await this.prisma.userRoleAssignment.findMany({
          where: {
            user_id: BigInt(userId),
            group_id: group.id,
          },
          include: {
            role: true,
          },
        });

        return {
          id: Number(group.id),
          code: group.code,
          name: group.name,
          type: group.type,
          description: group.description,
          context: group.context
            ? {
                id: Number(group.context.id),
                type: group.context.type,
                ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
                name: group.context.name,
              }
            : null,
          roles: roleAssignments
            .filter((ra) => ra.role) // Chỉ lấy roles hợp lệ
            .map((ra) => ({
              id: Number(ra.role!.id),
              code: ra.role!.code,
              name: ra.role!.name,
            })),
          joined_at: ug.joined_at,
        };
      }),
    );

    // Lọc bỏ các groups null (inactive)
    return result.filter((item) => item !== null);
  }
}
