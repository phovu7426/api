import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from '@/shared/entities/group.entity';
import { Context } from '@/shared/entities/context.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { UserRoleAssignment } from '@/shared/entities/user-role-assignment.entity';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Context)
    private readonly contextRepo: Repository<Context>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly rbacService: RbacService,
    private readonly rbacCache: RbacCacheService,
  ) {}

  /**
   * Kiểm tra user có phải owner của group không
   */
  async isOwner(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId, status: 'active' },
    });
    if (!group) return false;
    return group.owner_id === userId;
  }

  /**
   * Kiểm tra user có quyền quản lý group không (owner hoặc có permission group.manage)
   */
  async canManageGroup(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId, status: 'active' },
    });
    if (!group) return false;

    // Owner luôn có quyền
    if (group.owner_id === userId) return true;

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
  async getGroupContext(groupId: number): Promise<Context | null> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId, status: 'active' },
      relations: ['context'],
    });
    return group?.context || null;
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

    const group = await this.groupRepo.findOne({
      where: { id: groupId, status: 'active' },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const member = await this.userRepo.findOne({ where: { id: memberUserId } });
    if (!member) {
      throw new NotFoundException('Member user not found');
    }

    // Thêm user vào user_groups (nếu chưa có)
    const userGroupRepo = this.groupRepo.manager.getRepository(UserGroup);
    const existingUserGroup = await userGroupRepo.findOne({
      where: { user_id: memberUserId, group_id: groupId },
    });

    if (!existingUserGroup) {
      await userGroupRepo.save({
        user_id: memberUserId,
        group_id: groupId,
        joined_at: new Date(),
      });
    }

    // Gán roles qua user_role_assignments
    if (roleIds.length > 0) {
      // Validate roles
      const roles = await this.roleRepo.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }

      // Xóa roles cũ trong group này
      const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);
      await userRoleAssignmentRepo.delete({
        user_id: memberUserId,
        group_id: groupId,
      });

      // Thêm roles mới
      for (const roleId of roleIds) {
        await this.rbacService.assignRoleToUser(memberUserId, roleId, groupId);
      }
    } else {
      // Nếu không có roles, xóa tất cả roles trong group
      const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);
      await userRoleAssignmentRepo.delete({
        user_id: memberUserId,
        group_id: groupId,
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
    const userGroupRepo = this.groupRepo.manager.getRepository(UserGroup);
    const existingUserGroup = await userGroupRepo.findOne({
      where: { user_id: memberUserId, group_id: groupId },
    });

    if (!existingUserGroup) {
      throw new BadRequestException('User must be a member of the group before assigning roles');
    }

    // Xóa roles cũ trong group
    const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);
    await userRoleAssignmentRepo.delete({
      user_id: memberUserId,
      group_id: groupId,
    });

    // Thêm roles mới
    if (roleIds.length > 0) {
      // Validate roles
      const roles = await this.roleRepo.findBy({ id: In(roleIds) });
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

    const group = await this.groupRepo.findOne({
      where: { id: groupId, status: 'active' },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Không cho phép xóa owner
    if (group.owner_id === memberUserId) {
      throw new BadRequestException('Cannot remove owner from group');
    }

    // Xóa user khỏi user_groups
    const userGroupRepo = this.groupRepo.manager.getRepository(UserGroup);
    await userGroupRepo.delete({
      user_id: memberUserId,
      group_id: groupId,
    });

    // Xóa tất cả roles của user trong group
    const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);
    await userRoleAssignmentRepo.delete({
      user_id: memberUserId,
      group_id: groupId,
    });

    // Clear cache
    await this.rbacCache.clearUserPermissionsInGroup(memberUserId, groupId);
  }

  /**
   * Lấy danh sách members của group (từ user_groups và user_role_assignments)
   */
  async getGroupMembers(groupId: number): Promise<any[]> {
    const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);
    const members = await userRoleAssignmentRepo
      .createQueryBuilder('ura')
      .leftJoinAndSelect('ura.user', 'user')
      .leftJoinAndSelect('ura.role', 'role')
      .where('ura.group_id = :groupId', { groupId })
      .getMany();

    return members.map((m: UserRoleAssignment) => ({
      user_id: m.user_id,
      user: m.user ? {
        id: m.user.id,
        username: m.user.username,
        email: m.user.email,
      } : null,
      role_id: m.role_id,
      role: m.role ? {
        id: m.role.id,
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
    const userGroupRepo = this.groupRepo.manager.getRepository(UserGroup);
    const userRoleAssignmentRepo = this.groupRepo.manager.getRepository(UserRoleAssignment);

    // Lấy tất cả groups mà user là member (từ user_groups)
    const userGroups = await userGroupRepo.find({
      where: { user_id: userId },
      relations: ['group'],
      order: { joined_at: 'DESC' },
    });

    // Xử lý từng group để lấy context và roles
    const result = await Promise.all(
      userGroups.map(async (ug) => {
        const group = ug.group;

        // Kiểm tra group có tồn tại không
        if (!group) {
          return null;
        }

        // Chỉ lấy groups active
        if (group.status !== 'active') {
          return null;
        }

        // Lấy context của group
        const context = await this.getGroupContext(group.id);

        // Lấy roles của user trong group này
        const roleAssignments = await userRoleAssignmentRepo.find({
          where: {
            user_id: userId,
            group_id: group.id,
          },
          relations: ['role'],
        });

        return {
          id: group.id,
          code: group.code,
          name: group.name,
          type: group.type,
          description: group.description,
          context: context
            ? {
                id: context.id.toString(),
                type: context.type,
                ref_id: context.ref_id?.toString() || null,
                name: context.name,
              }
            : null,
          roles: roleAssignments
            .filter((ra) => ra.role) // Chỉ lấy roles hợp lệ
            .map((ra) => ({
              id: ra.role!.id,
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

