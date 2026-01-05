import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Context } from '@/shared/entities/context.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class ContextService extends CrudService<Context> {
  constructor(
    @InjectRepository(Context)
    private readonly contextRepo: Repository<Context>,
    @Inject(forwardRef(() => RbacService))
    private readonly rbacService: RbacService,
  ) {
    super(contextRepo);
  }

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
  async resolveContext(req: Request): Promise<Context> {
    const contextId =
      req.headers['x-context-id'] ||
      (req.query as any).context_id;

    if (!contextId) {
      throw new NotFoundException('Context ID is required in header (X-Context-Id) or query (?context_id)');
    }

    const context = await this.contextRepo.findOne({
      where: { id: Number(contextId), status: 'active' },
    });

    if (!context) {
      throw new NotFoundException('Context not found');
    }

    return context;
  }

  /**
   * ✅ MỚI: Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
   */
  async getUserContexts(userId: number): Promise<Context[]> {
    return this.contextRepo
      .createQueryBuilder('context')
      .innerJoin('context.groups', 'group')
      .innerJoin('group.user_groups', 'ug', 'ug.user_id = :userId', { userId })
      .where('context.status = :status', { status: 'active' })
      .andWhere('group.status = :groupStatus', { groupStatus: 'active' })
      .distinct(true)
      .getMany();
  }

  /**
   * Lấy các contexts được phép truy cập
   * - System context (id=1) luôn được phép cho mọi user đã authenticated
   * - Các contexts khác chỉ được phép nếu user có role trong đó
   */
  async getUserContextsForTransfer(userId: number): Promise<Context[]> {
    // Lấy system context (id=1) - luôn được phép
    const systemContext = await this.contextRepo
      .createQueryBuilder('context')
      .where('context.id = :id', { id: 1 })
      .andWhere('context.status = :status', { status: 'active' })
      .getOne();

    // Lấy các contexts mà user có quyền truy cập (có role)
    const userContexts = await this.getUserContexts(userId);

    // Gộp lại và loại bỏ trùng lặp (nếu system context đã có trong userContexts)
    const allContexts: Context[] = [];
    if (systemContext) {
      allContexts.push(systemContext);
    }
    allContexts.push(...userContexts);
    
    // Loại bỏ trùng lặp dựa trên ID
    const uniqueContexts = allContexts.filter(
      (ctx, index, self) => index === self.findIndex((c) => Number(c.id) === Number(ctx.id)),
    );

    return uniqueContexts;
  }

  /**
   * Tạo system context mặc định (chạy 1 lần khi setup)
   */
  async createSystemContext(): Promise<Context> {
    const exists = await this.contextRepo
      .createQueryBuilder('context')
      .where('context.type = :type', { type: 'system' })
      .andWhere('context.ref_id IS NULL')
      .getOne();

    if (exists) return exists;

    const context = this.contextRepo.create({
      type: 'system',
      ref_id: null,
      name: 'System',
      status: 'active',
    });

    return this.contextRepo.save(context);
  }

  /**
   * Lấy context theo ID
   */
  async findById(id: number): Promise<Context | null> {
    return this.contextRepo.findOne({
      where: { id, status: 'active' },
    });
  }

  /**
   * Lấy context theo type và ref_id
   */
  async findByTypeAndRefId(type: string, refId: number | null): Promise<Context | null> {
    const queryBuilder = this.contextRepo
      .createQueryBuilder('context')
      .where('context.type = :type', { type });

    if (refId === null) {
      queryBuilder.andWhere('context.ref_id IS NULL');
    } else {
      queryBuilder.andWhere('context.ref_id = :refId', { refId });
    }

    return queryBuilder.getOne();
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
  ): Promise<Context> {
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
    const existingByCode = await this.contextRepo.findOne({
      where: { code } as any,
    });
    if (existingByCode) {
      throw new BadRequestException(`Context with code "${code}" already exists`);
    }

    const context = this.contextRepo.create({
      type: data.type,
      ref_id: data.ref_id ?? null,
      name: data.name,
      code,
      status: data.status || 'active',
    });

    return this.contextRepo.save(context);
  }

  /**
   * Update context (chỉ system admin)
   */
  async updateContext(
    id: number,
    data: Partial<{ name: string; code: string; status: string }>,
    requesterUserId: number,
  ): Promise<Context> {
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
      const existing = await this.contextRepo.findOne({
        where: { code: data.code } as any,
      });
      if (existing) {
        throw new BadRequestException(`Context with code "${data.code}" already exists`);
      }
    }

    Object.assign(context, data);
    return this.contextRepo.save(context);
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
    const groupsCount = await this.contextRepo.manager
      .getRepository('Group')
      .count({ where: { context_id: id } } as any);

    if (groupsCount > 0) {
      throw new BadRequestException(`Cannot delete context: ${groupsCount} group(s) are using this context`);
    }

    // Soft delete
    await this.contextRepo.softDelete(id);
  }
}

