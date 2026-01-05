import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@/shared/entities/context.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class AdminContextService extends CrudService<Context> {
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

