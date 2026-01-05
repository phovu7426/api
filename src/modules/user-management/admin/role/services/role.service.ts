import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { Auth } from '@/common/utils/auth.util';

@Injectable()
export class RoleService {
  // Biến tạm để lưu context_ids khi create/update
  private tempContextIds: number[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacCache: RbacCacheService,
  ) {}

  /**
   * Get list of roles
   */
  async getList(filters?: any, options?: any) {
    // Filter by context if not system admin
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    let roleIds: bigint[] | undefined = undefined;
    if (context && context.type !== 'system') {
      const roleContexts = await this.prisma.roleContext.findMany({
        where: { context_id: BigInt(contextId) },
        select: { role_id: true },
      });
      roleIds = roleContexts.map((rc: any) => rc.role_id);
      if (!roleIds || roleIds.length === 0) {
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

    const where: Prisma.RoleWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.code && { code: { contains: filters.code } }),
      ...(roleIds && { id: { in: roleIds } }),
      ...(filters?.parent_id !== undefined && { parent_id: filters.parent_id ? BigInt(filters.parent_id) : null }),
      deleted_at: null,
    };

    const orderBy: Prisma.RoleOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const include: Prisma.RoleInclude = {
      parent: true,
      children: true,
      role_permissions: {
        include: {
          permission: true,
        },
      },
      role_contexts: context && context.type === 'system' ? {
        include: {
          context: true,
        },
      } : {
        where: { context_id: BigInt(contextId) },
        include: {
          context: true,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: this.transformRoleList(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one role
   */
  async getOne(where: any, options?: any): Promise<any | null> {
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    const whereInput: Prisma.RoleWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.code && { code: where.code }),
      deleted_at: null,
    };

    const include: Prisma.RoleInclude = {
      parent: true,
      children: true,
      role_permissions: {
        include: {
          permission: true,
        },
      },
      role_contexts: context && context.type === 'system' ? {
        include: {
          context: true,
        },
      } : {
        where: { context_id: BigInt(contextId) },
        include: {
          context: true,
        },
      },
    };

    const role = await this.prisma.role.findFirst({
      where: whereInput,
      include,
    });

    if (!role) {
      return null;
    }

    return this.transformRole(role);
  }

  /**
   * Create role
   */
  async create(data: any, createdBy?: number) {
    // Validate code unique
    if (data.code) {
      const exists = await this.prisma.role.findFirst({
        where: { code: data.code, deleted_at: null },
      });
      if (exists) {
        throw new Error('Role code already exists');
      }
    }

    // Handle context_ids
    const contextIds = data.context_ids;
    if (contextIds && Array.isArray(contextIds) && contextIds.length > 0) {
      // Validate contexts exist
      const contexts = await this.prisma.context.findMany({
        where: { id: { in: contextIds.map(id => BigInt(id)) } },
      });
      if (contexts.length !== contextIds.length) {
        throw new BadRequestException('Some context IDs are invalid');
      }
      this.tempContextIds = contextIds;
    } else {
      this.tempContextIds = [];
    }

    const role = await this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        status: data.status ?? 'active',
        parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        created_user_id: createdBy ? BigInt(createdBy) : null,
        updated_user_id: createdBy ? BigInt(createdBy) : null,
        role_permissions: data.permission_ids && data.permission_ids.length > 0 ? {
          create: data.permission_ids.map((id: number) => ({
            permission_id: BigInt(id),
          })),
        } : undefined,
      },
      include: {
        parent: true,
        children: true,
        role_permissions: {
          include: {
            permission: true,
          },
        },
        role_contexts: {
          include: {
            context: true,
          },
        },
      },
    });

    // Handle context_ids
    if (this.tempContextIds !== null) {
      const currentUserId = Auth.id();
      
      if (this.tempContextIds.length > 0) {
        await this.prisma.roleContext.createMany({
          data: this.tempContextIds.map(contextId => ({
            role_id: role.id,
            context_id: BigInt(contextId),
            created_user_id: currentUserId ? BigInt(currentUserId) : null,
            updated_user_id: currentUserId ? BigInt(currentUserId) : null,
          })),
        });
      }
      this.tempContextIds = null;
    }

    return this.transformRole(role);
  }

  /**
   * Update role
   */
  async update(id: number, data: any, updatedBy?: number) {
    const existing = await this.prisma.role.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Validate code unique if changed
    if (data.code && data.code !== existing.code) {
      const exists = await this.prisma.role.findFirst({
        where: { code: data.code, deleted_at: null },
      });
      if (exists) {
        throw new Error('Role code already exists');
      }
    }

    // Handle context_ids
    if (data.context_ids !== undefined) {
      if (Array.isArray(data.context_ids) && data.context_ids.length > 0) {
        const contexts = await this.prisma.context.findMany({
          where: { id: { in: data.context_ids.map((id: number) => BigInt(id)) } },
        });
        if (contexts.length !== data.context_ids.length) {
          throw new BadRequestException('Some context IDs are invalid');
        }
        this.tempContextIds = data.context_ids;
      } else {
        this.tempContextIds = [];
      }
    }

    // Handle permission_ids separately if provided
    if (data.permission_ids !== undefined) {
      const currentUserId = Auth.id();
      
      // Delete all existing role_permissions
      await this.prisma.rolePermission.deleteMany({
        where: { role_id: BigInt(id) },
      });
      
      // Create new role_permissions if any
      if (data.permission_ids.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: data.permission_ids.map((permId: number) => ({
            role_id: BigInt(id),
            permission_id: BigInt(permId),
            created_user_id: currentUserId ? BigInt(currentUserId) : null,
            updated_user_id: currentUserId ? BigInt(currentUserId) : null,
          })),
        });
      }
    }

    const role = await this.prisma.role.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.parent_id !== undefined && { parent_id: data.parent_id ? BigInt(data.parent_id) : null }),
        updated_user_id: updatedBy ? BigInt(updatedBy) : existing.updated_user_id,
      },
      include: {
        parent: true,
        children: true,
        role_permissions: {
          include: {
            permission: true,
          },
        },
        role_contexts: {
          include: {
            context: true,
          },
        },
      },
    });

    // Handle context_ids sync
    if (this.tempContextIds !== null) {
      const currentUserId = Auth.id();
      
      // Delete all old contexts
      await this.prisma.roleContext.deleteMany({
        where: { role_id: BigInt(id) },
      });

      // Add new contexts
      if (this.tempContextIds.length > 0) {
        await this.prisma.roleContext.createMany({
          data: this.tempContextIds.map(contextId => ({
            role_id: BigInt(id),
            context_id: BigInt(contextId),
            created_user_id: currentUserId ? BigInt(currentUserId) : null,
            updated_user_id: currentUserId ? BigInt(currentUserId) : null,
          })),
        });
      }
      this.tempContextIds = null;
    }

    // Bump cache version
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return this.transformRole(role);
  }

  /**
   * Delete role (soft delete)
   */
  async delete(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: BigInt(id) },
      include: {
        children: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role has children
    if (role.children.length > 0) {
      throw new BadRequestException('Cannot delete role with children');
    }

    // Check if role is assigned to users
    const userCount = await this.prisma.userRoleAssignment.count({
      where: { role_id: BigInt(id) },
    });

    if (userCount > 0) {
      throw new BadRequestException('Cannot delete role assigned to users');
    }

    // Bump cache version
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return this.prisma.role.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Assign permissions to role (sync - replace all)
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: BigInt(roleId) },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds.map(id => BigInt(id)) } },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
    }

    const currentUserId = Auth.id();
    
    // Delete all existing role_permissions
    await this.prisma.rolePermission.deleteMany({
      where: { role_id: BigInt(roleId) },
    });
    
    // Create new role_permissions if any
    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map(id => ({
          role_id: BigInt(roleId),
          permission_id: BigInt(id),
          created_user_id: currentUserId ? BigInt(currentUserId) : null,
          updated_user_id: currentUserId ? BigInt(currentUserId) : null,
        })),
      });
    }

    const updated = await this.prisma.role.findUnique({
      where: { id: BigInt(roleId) },
      include: {
        role_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return updated;
  }

  /**
   * Transform role list
   */
  private transformRoleList(roles: any[]): any[] {
    return roles.map(role => this.transformRole(role));
  }

  /**
   * Transform single role
   */
  private transformRole(role: any): any {
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    const result: any = {
      ...role,
      id: Number(role.id),
      parent_id: role.parent_id ? Number(role.parent_id) : null,
      parent: role.parent ? {
        id: Number(role.parent.id),
        code: role.parent.code,
        name: role.parent.name,
        status: role.parent.status,
      } : null,
      children: role.children?.map((child: any) => ({
        id: Number(child.id),
        code: child.code,
        name: child.name,
        status: child.status,
      })) || [],
      permissions: role.role_permissions?.map((rp: any) => ({
        id: Number(rp.permission.id),
        code: rp.permission.code,
        name: rp.permission.name,
        status: rp.permission.status,
      })) || [],
    };

    // Transform role_contexts
    if (role.role_contexts) {
      let filteredRoleContexts = role.role_contexts;
      if (context && context.type !== 'system') {
        filteredRoleContexts = role.role_contexts.filter((rc: any) => Number(rc.context_id) === contextId);
      }

      result.context_ids = filteredRoleContexts.map((rc: any) => Number(rc.context_id));
      result.contexts = filteredRoleContexts
        .filter((rc: any) => rc.context)
        .map((rc: any) => {
          const ctx = rc.context;
          return {
            id: Number(ctx.id),
            type: ctx.type,
            name: ctx.name,
            status: ctx.status,
            ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
          };
        });
    } else {
      result.context_ids = [];
      result.contexts = [];
    }

    return result;
  }

  /**
   * Get simple list (for dropdowns)
   */
  async getSimpleList(filters?: any) {
    const where: Prisma.RoleWhereInput = {
      ...(filters?.status && { status: filters.status }),
      deleted_at: null,
    };

    const data = await this.prisma.role.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
      },
    });

    return {
      data: data.map((role: any) => ({
        id: Number(role.id),
        code: role.code,
        name: role.name,
        status: role.status,
      })),
    };
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.RoleOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.RoleOrderByWithRelationInput;
    });
  }
}
