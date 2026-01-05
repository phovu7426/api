import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Request } from 'express';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class ContextService {
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
   * Resolve context từ request
   * - Header: X-Context-Id
   * - Query: ?context_id=1
   * Lưu ý: Phải có context_id trong header hoặc query, không có default
   */
  async resolveContext(req: Request): Promise<any> {
    const contextId =
      req.headers['x-context-id'] ||
      (req.query as any).context_id;

    if (!contextId) {
      throw new NotFoundException('Context ID is required in header (X-Context-Id) or query (?context_id)');
    }

    const context = await this.prisma.context.findFirst({
      where: { 
        id: BigInt(Number(contextId)), 
        status: 'active',
        deleted_at: null,
      },
    });

    if (!context) {
      throw new NotFoundException('Context not found');
    }

    return {
      ...context,
      id: Number(context.id),
      ref_id: context.ref_id ? Number(context.ref_id) : null,
    };
  }

  /**
   * Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
   */
  async getUserContexts(userId: number): Promise<any[]> {
    const contexts = await this.prisma.context.findMany({
      where: {
        status: 'active',
        deleted_at: null,
        groups: {
          some: {
            status: 'active',
            deleted_at: null,
            user_groups: {
              some: {
                user_id: BigInt(userId),
              },
            },
          },
        },
      },
      distinct: ['id'],
    });

    return contexts.map(ctx => ({
      ...ctx,
      id: Number(ctx.id),
      ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
    }));
  }

  /**
   * Lấy các contexts được phép truy cập
   * - System context (id=1) luôn được phép cho mọi user đã authenticated
   * - Các contexts khác chỉ được phép nếu user có role trong đó
   */
  async getUserContextsForTransfer(userId: number): Promise<any[]> {
    // Lấy system context (id=1) - luôn được phép
    const systemContext = await this.prisma.context.findUnique({
      where: { id: BigInt(1) },
    });

    // Lấy các contexts mà user có quyền truy cập (có role)
    const userContexts = await this.getUserContexts(userId);

    // Gộp lại và loại bỏ trùng lặp
    const allContexts: any[] = [];
    if (systemContext && systemContext.status === 'active' && !systemContext.deleted_at) {
      allContexts.push({
        ...systemContext,
        id: Number(systemContext.id),
        ref_id: systemContext.ref_id ? Number(systemContext.ref_id) : null,
      });
    }
    allContexts.push(...userContexts);
    
    // Loại bỏ trùng lặp dựa trên ID
    const uniqueContexts = allContexts.filter(
      (ctx, index, self) => index === self.findIndex((c) => c.id === ctx.id),
    );

    return uniqueContexts;
  }

  /**
   * Tạo system context mặc định (chạy 1 lần khi setup)
   */
  async createSystemContext(): Promise<any> {
    const exists = await this.prisma.context.findFirst({
      where: {
        type: 'system',
        ref_id: null,
        deleted_at: null,
      },
    });

    if (exists) {
      return {
        ...exists,
        id: Number(exists.id),
        ref_id: exists.ref_id ? Number(exists.ref_id) : null,
      };
    }

    const context = await this.prisma.context.create({
      data: {
        type: 'system',
        ref_id: null,
        name: 'System',
        code: 'system',
        status: 'active',
      },
    });

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

    if (!context || context.status !== 'active' || context.deleted_at) {
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
}
