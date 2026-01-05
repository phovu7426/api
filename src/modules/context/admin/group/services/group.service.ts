import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class AdminGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * Kiểm tra user có phải system admin không
   */
  async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  /**
   * Get list of groups
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.GroupWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.context_id && { context_id: BigInt(filters.context_id) }),
      deleted_at: null,
    };

    const orderBy: Prisma.GroupOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          context: true,
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: data.map(group => ({
        ...group,
        id: Number(group.id),
        context_id: Number(group.context_id),
        owner_id: group.owner_id ? Number(group.owner_id) : null,
        context: group.context ? {
          ...group.context,
          id: Number(group.context.id),
          ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
        } : null,
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
   * Get one group
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: Prisma.GroupWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.code && { code: where.code }),
      deleted_at: null,
    };

    const group = await this.prisma.group.findFirst({
      where: whereInput,
      include: {
        context: true,
      },
    });

    if (!group) {
      return null;
    }

    return {
      ...group,
      id: Number(group.id),
      context_id: Number(group.context_id),
      owner_id: group.owner_id ? Number(group.owner_id) : null,
      context: group.context ? {
        ...group.context,
        id: Number(group.context.id),
        ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
      } : null,
    };
  }

  /**
   * Lấy group theo ID
   */
  async findById(id: number): Promise<any | null> {
    const group = await this.prisma.group.findUnique({
      where: { id: BigInt(id) },
      include: {
        context: true,
      },
    });

    if (!group || group.status !== 'active') {
      return null;
    }

    return {
      ...group,
      id: Number(group.id),
      context_id: Number(group.context_id),
      owner_id: group.owner_id ? Number(group.owner_id) : null,
      context: group.context ? {
        ...group.context,
        id: Number(group.context.id),
        ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
      } : null,
    };
  }

  /**
   * Lấy group theo code
   */
  async findByCode(code: string): Promise<any | null> {
    const group = await this.prisma.group.findFirst({
      where: { code, status: 'active', deleted_at: null },
      include: {
        context: true,
      },
    });

    if (!group) {
      return null;
    }

    return {
      ...group,
      id: Number(group.id),
      context_id: Number(group.context_id),
      owner_id: group.owner_id ? Number(group.owner_id) : null,
      context: group.context ? {
        ...group.context,
        id: Number(group.context.id),
        ref_id: group.context.ref_id ? Number(group.context.ref_id) : null,
      } : null,
    };
  }

  /**
   * Tạo group mới (chỉ system admin)
   * Bắt buộc phải có context_id
   */
  async createGroup(
    data: {
      type: string;
      code: string;
      name: string;
      description?: string;
      metadata?: any;
      owner_id?: number;
      context_id: number;
    },
    requesterUserId: number,
  ): Promise<any> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create groups');
    }

    // Check context exists
    const context = await this.prisma.context.findUnique({
      where: { id: BigInt(data.context_id) },
    });
    if (!context || context.status !== 'active') {
      throw new NotFoundException(`Context with id ${data.context_id} not found`);
    }

    // Check code unique
    const existing = await this.prisma.group.findFirst({
      where: { code: data.code, deleted_at: null },
    });
    if (existing) {
      throw new BadRequestException(`Group with code "${data.code}" already exists`);
    }

    // Create group
    const savedGroup = await this.prisma.group.create({
      data: {
        type: data.type,
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        metadata: data.metadata ?? null,
        owner_id: data.owner_id ? BigInt(data.owner_id) : null,
        context_id: BigInt(data.context_id),
        status: 'active',
        created_user_id: requesterUserId ? BigInt(requesterUserId) : null,
        updated_user_id: requesterUserId ? BigInt(requesterUserId) : null,
      },
      include: {
        context: true,
      },
    });

    // Nếu có owner, tự động thêm owner vào user_groups và gán role 'admin'
    if (savedGroup.owner_id) {
      // Thêm owner vào user_groups
      const existingUserGroup = await this.prisma.userGroup.findFirst({
        where: { 
          user_id: savedGroup.owner_id, 
          group_id: savedGroup.id 
        },
      });

      if (!existingUserGroup) {
        await this.prisma.userGroup.create({
          data: {
            user_id: savedGroup.owner_id,
            group_id: savedGroup.id,
            joined_at: new Date(),
          },
        });
      }

      // Gán role admin cho owner
      const ownerRole = await this.prisma.role.findFirst({
        where: { code: 'admin', status: 'active' },
      });
      if (ownerRole) {
        await this.rbacService.assignRoleToUser(Number(savedGroup.owner_id), Number(ownerRole.id), Number(savedGroup.id));
      }
    }

    return {
      ...savedGroup,
      id: Number(savedGroup.id),
      context_id: Number(savedGroup.context_id),
      owner_id: savedGroup.owner_id ? Number(savedGroup.owner_id) : null,
      context: savedGroup.context ? {
        ...savedGroup.context,
        id: Number(savedGroup.context.id),
        ref_id: savedGroup.context.ref_id ? Number(savedGroup.context.ref_id) : null,
      } : null,
    };
  }

  /**
   * Update group (chỉ system admin)
   */
  async updateGroup(id: number, data: Partial<{ name: string; description: string; metadata: any }>, requesterUserId?: number): Promise<any> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const updated = await this.prisma.group.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
        ...(requesterUserId && { updated_user_id: BigInt(requesterUserId) }),
      },
      include: {
        context: true,
      },
    });

    return {
      ...updated,
      id: Number(updated.id),
      context_id: Number(updated.context_id),
      owner_id: updated.owner_id ? Number(updated.owner_id) : null,
      context: updated.context ? {
        ...updated.context,
        id: Number(updated.context.id),
        ref_id: updated.context.ref_id ? Number(updated.context.ref_id) : null,
      } : null,
    };
  }

  /**
   * Delete group (soft delete)
   */
  async deleteGroup(id: number): Promise<void> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Soft delete
    await this.prisma.group.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.GroupOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.GroupOrderByWithRelationInput;
    });
  }
}
