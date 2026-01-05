import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from '@/modules/user-management/admin/user/dtos/change-password.dto';
import { RequestContext } from '@/common/utils/request-context.util';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class UserService {
  // Biến tạm để lưu role_ids khi create/update
  private tempRoleIds: number[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * Get list of users
   */
  async getList(filters?: any, options?: any) {
    // Filter by group if not system admin
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;
    const groupId = RequestContext.get<number | null>('groupId');

    let userIds: bigint[] | undefined = undefined;
    if (context && context.type !== 'system' && contextId !== 1 && groupId) {
      const userGroups = await this.prisma.userGroup.findMany({
        where: { group_id: BigInt(groupId) },
        select: { user_id: true },
      });
      userIds = userGroups.map((ug: any) => ug.user_id);
      if (!userIds || userIds.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page: options?.page || 1,
            limit: options?.limit || 10,
            totalPages: 0,
          },
        };
      }
    }

    const where: Prisma.UserWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.email && { email: { contains: filters.email } }),
      ...(filters?.username && { username: { contains: filters.username } }),
      ...(userIds && { id: { in: userIds } }),
      deleted_at: null,
    };

    const orderBy: Prisma.UserOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          profile: true,
          user_role_assignments: groupId ? {
            where: { group_id: BigInt(groupId) },
          } : true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: this.transformUserList(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one user
   */
  async getOne(where: any, options?: any): Promise<any | null> {
    const groupId = RequestContext.get<number | null>('groupId');

    const whereInput: Prisma.UserWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.email && { email: where.email }),
      ...(where.username && { username: where.username }),
      deleted_at: null,
    };

    const user = await this.prisma.user.findFirst({
      where: whereInput,
      include: {
        profile: true,
        user_role_assignments: groupId ? {
          where: { group_id: BigInt(groupId) },
        } : true,
      },
    });

    if (!user) {
      return null;
    }

    return this.transformUser(user);
  }

  /**
   * Create user
   */
  async create(data: any, createdBy?: number) {
    // Hash password
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Handle role_ids
    const roleIds = data.role_ids;
    if (roleIds !== undefined) {
      if (Array.isArray(roleIds)) {
        this.tempRoleIds = roleIds.map(id => Number(id)).filter(id => !isNaN(id));
      } else {
        this.tempRoleIds = [];
      }
    }

    // Handle profile
    const profilePayload = data.profile ?? null;
    delete data.profile;
    delete data.role_ids;

    const user = await this.prisma.user.create({
      data: {
        username: data.username ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        password: data.password ?? null,
        status: data.status ?? 'active',
        created_user_id: createdBy ? BigInt(createdBy) : null,
        updated_user_id: createdBy ? BigInt(createdBy) : null,
        profile: profilePayload ? {
          create: profilePayload,
        } : undefined,
      },
      include: {
        profile: true,
        user_role_assignments: true,
      },
    });

    // Handle role_ids - assign roles in current group
    if (this.tempRoleIds !== null && this.tempRoleIds.length > 0) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(
          Number(user.id),
          groupId,
          this.tempRoleIds,
          true // skipValidation = true for admin API
        );
      }
      this.tempRoleIds = null;
    }

    return this.transformUser(user);
  }

  /**
   * Update user
   */
  async update(id: number, data: any, updatedBy?: number) {
    const existing = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else if ('password' in data) {
      delete data.password;
    }

    // Handle role_ids
    const roleIds = data.role_ids;
    if (roleIds !== undefined) {
      if (Array.isArray(roleIds)) {
        this.tempRoleIds = roleIds.map(id => Number(id)).filter(id => !isNaN(id));
      } else {
        this.tempRoleIds = [];
      }
    }

    // Handle profile
    const profilePayload = data.profile ?? null;
    delete data.profile;
    delete data.role_ids;

    const user = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.password !== undefined && { password: data.password }),
        ...(data.status !== undefined && { status: data.status }),
        updated_user_id: updatedBy ? BigInt(updatedBy) : existing.updated_user_id,
        profile: profilePayload ? {
          upsert: {
            create: profilePayload,
            update: profilePayload,
          },
        } : undefined,
      },
      include: {
        profile: true,
        user_role_assignments: true,
      },
    });

    // Handle role_ids - sync roles in current group
    if (this.tempRoleIds !== null) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(
          Number(user.id),
          groupId,
          this.tempRoleIds,
          true // skipValidation = true for admin API
        );
      }
      this.tempRoleIds = null;
    }

    return this.transformUser(user);
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete profile
    await this.prisma.profile.deleteMany({
      where: { user_id: BigInt(id) },
    }).catch(() => undefined);

    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Change password
   */
  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(id) } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { password: hashedPassword },
    });
  }

  /**
   * Transform user list
   */
  private transformUserList(users: any[]): any[] {
    const groupId = RequestContext.get<number | null>('groupId');
    return users.map(user => this.transformUser(user, groupId));
  }

  /**
   * Transform single user
   */
  private transformUser(user: any, groupId?: number | null): any {
    const currentGroupId = groupId ?? RequestContext.get<number | null>('groupId');

    const result: any = {
      ...user,
      id: Number(user.id),
      created_user_id: user.created_user_id ? Number(user.created_user_id) : null,
      updated_user_id: user.updated_user_id ? Number(user.updated_user_id) : null,
    };

    // Get role_ids from user_role_assignments of current group
    if (currentGroupId && user.user_role_assignments) {
      const roleIds = user.user_role_assignments
        .filter((ura: any) => Number(ura.group_id) === currentGroupId)
        .map((ura: any) => Number(ura.role_id));
      result.role_ids = roleIds;
    } else {
      result.role_ids = [];
    }

    // Remove user_role_assignments from response
    delete result.user_role_assignments;

    return result;
  }

  /**
   * Get simple list (for dropdowns)
   */
  async getSimpleList(filters?: any) {
    const where: Prisma.UserWhereInput = {
      ...(filters?.status && { status: filters.status }),
      deleted_at: null,
    };

    const data = await this.prisma.user.findMany({
      where,
      orderBy: { username: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
      },
    });

    return {
      data: data.map((user: any) => ({
        id: Number(user.id),
        username: user.username,
        email: user.email,
        status: user.status,
      })),
    };
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.UserOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.UserOrderByWithRelationInput;
    });
  }
}
