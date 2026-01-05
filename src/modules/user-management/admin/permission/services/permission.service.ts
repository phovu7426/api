import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacCache: RbacCacheService,
  ) {}

  /**
   * Get list of permissions
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PermissionWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.code && { code: { contains: filters.code } }),
      ...(filters?.parent_id !== undefined && { parent_id: filters.parent_id ? BigInt(filters.parent_id) : null }),
      deleted_at: null,
    };

    const orderBy: Prisma.PermissionOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
        },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      data: data.map(perm => ({
        ...perm,
        id: Number(perm.id),
        parent_id: perm.parent_id ? Number(perm.parent_id) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one permission
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: Prisma.PermissionWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.code && { code: where.code }),
      deleted_at: null,
    };

    const permission = await this.prisma.permission.findFirst({
      where: whereInput,
      include: {
        parent: true,
        children: true,
      },
    });

    if (!permission) {
      return null;
    }

    return {
      ...permission,
      id: Number(permission.id),
      parent_id: permission.parent_id ? Number(permission.parent_id) : null,
    };
  }

  /**
   * Create permission
   */
  async create(data: any, createdBy?: number) {
    // Validate code unique
    if (data.code) {
      const exists = await this.getOne({ code: data.code });
      if (exists) {
        throw new Error('Permission code already exists');
      }
    }

    return this.prisma.permission.create({
      data: {
        code: data.code,
        name: data.name,
        status: data.status ?? 'active',
        parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        created_user_id: createdBy ? BigInt(createdBy) : null,
        updated_user_id: createdBy ? BigInt(createdBy) : null,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Update permission
   */
  async update(id: number, data: any, updatedBy?: number) {
    const existing = await this.prisma.permission.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Permission with ID ${id} not found`);
    }

    // Validate code unique if changed
    if (data.code && data.code !== existing.code) {
      const exists = await this.getOne({ code: data.code });
      if (exists) {
        throw new Error('Permission code already exists');
      }
    }

    const updated = await this.prisma.permission.update({
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
      },
    });

    // RBAC changed - bump cache version
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return {
      ...updated,
      id: Number(updated.id),
      parent_id: updated.parent_id ? Number(updated.parent_id) : null,
    };
  }

  /**
   * Delete permission (soft delete)
   */
  async delete(id: number) {
    // RBAC changed - bump cache version
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return this.prisma.permission.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Get simple list (for dropdowns)
   */
  async getSimpleList(filters?: any) {
    const where: Prisma.PermissionWhereInput = {
      ...(filters?.status && { status: filters.status }),
      deleted_at: null,
    };

    const data = await this.prisma.permission.findMany({
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
      data: data.map(perm => ({
        id: Number(perm.id),
        code: perm.code,
        name: perm.name,
        status: perm.status,
      })),
    };
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.PermissionOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PermissionOrderByWithRelationInput;
    });
  }
}
