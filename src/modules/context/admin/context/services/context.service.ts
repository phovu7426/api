import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class AdminContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * Kiểm tra user có phải system admin không
   */
  private async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  /**
   * Get list of contexts
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.ContextWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      deleted_at: null,
    };

    const orderBy: Prisma.ContextOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.context.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.context.count({ where }),
    ]);

    return {
      data: data.map(ctx => ({
        ...ctx,
        id: Number(ctx.id),
        ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
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
   * Get one context
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: Prisma.ContextWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.code && { code: where.code }),
      deleted_at: null,
    };

    const context = await this.prisma.context.findFirst({
      where: whereInput,
    });

    if (!context) {
      return null;
    }

    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }

  /**
   * Lấy context theo ID
   */
  async findById(id: number): Promise<any | null> {
    const context = await this.prisma.context.findUnique({
      where: { id: BigInt(id) },
    });

    if (!context || context.status !== 'active') {
      return null;
    }

    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }

  /**
   * Lấy context theo type và ref_id
   */
  async findByTypeAndRefId(type: string, refId: number | null): Promise<any | null> {
    const context = await this.prisma.context.findFirst({
      where: {
        type,
        ref_id: refId === null ? null : BigInt(refId),
        deleted_at: null,
      },
    });

    if (!context) {
      return null;
    }

    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }

  /**
   * Tạo context mới (chỉ system admin)
   */
  async createContext(
    data: {
      type: string;
      ref_id?: number | null;
      name: string;
      code?: string;
      status?: string;
    },
    requesterUserId: number,
  ): Promise<any> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create contexts');
    }

    // Check unique constraint: (type, ref_id)
    const existing = await this.findByTypeAndRefId(data.type, data.ref_id ?? null);
    if (existing) {
      throw new BadRequestException(`Context with type "${data.type}" and ref_id "${data.ref_id ?? 'null'}" already exists`);
    }

    // Generate code nếu không có
    const code = data.code || `${data.type}-${data.ref_id ?? 'system'}`;

    // Check code unique
    const existingByCode = await this.prisma.context.findFirst({
      where: { code, deleted_at: null },
    });
    if (existingByCode) {
      throw new BadRequestException(`Context with code "${code}" already exists`);
    }

    const context = await this.prisma.context.create({
      data: {
        type: data.type,
        ref_id: data.ref_id ? BigInt(data.ref_id) : null,
        name: data.name,
        code,
        status: data.status || 'active',
        created_user_id: requesterUserId ? BigInt(requesterUserId) : null,
        updated_user_id: requesterUserId ? BigInt(requesterUserId) : null,
      },
    });

    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }

  /**
   * Update context (chỉ system admin)
   */
  async updateContext(
    id: number,
    data: Partial<{ name: string; code: string; status: string }>,
    requesterUserId: number,
  ): Promise<any> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can update contexts');
    }

    const context = await this.findById(id);
    if (!context) {
      throw new NotFoundException('Context not found');
    }

    // Không cho phép update system context (id=1)
    if (id === 1) {
      throw new BadRequestException('Cannot update system context');
    }

    // Check code unique nếu có thay đổi code
    if (data.code && data.code !== context.code) {
      const existing = await this.prisma.context.findFirst({
        where: { code: data.code, deleted_at: null },
      });
      if (existing) {
        throw new BadRequestException(`Context with code "${data.code}" already exists`);
      }
    }

    const updated = await this.prisma.context.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.status !== undefined && { status: data.status }),
        updated_user_id: requesterUserId ? BigInt(requesterUserId) : null,
      },
    });

    return {
      ...updated,
      id: Number(updated.id),
      ref_id: updated.ref_id ? Number(updated.ref_id) : null,
    };
  }

  /**
   * Xóa context (chỉ system admin)
   */
  async deleteContext(id: number): Promise<void> {
    const context = await this.findById(id);
    if (!context) {
      throw new NotFoundException('Context not found');
    }

    // Không cho phép xóa system context (id=1)
    if (id === 1) {
      throw new BadRequestException('Cannot delete system context');
    }

    // Check xem có groups nào đang dùng context này không
    const groupsCount = await this.prisma.group.count({
      where: { context_id: BigInt(id), deleted_at: null },
    });

    if (groupsCount > 0) {
      throw new BadRequestException(`Cannot delete context: ${groupsCount} group(s) are using this context`);
    }

    // Soft delete
    await this.prisma.context.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.ContextOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.ContextOrderByWithRelationInput;
    });
  }
}
