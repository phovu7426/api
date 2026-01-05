import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@/shared/entities/context.entity';

@Injectable()
export class UserContextService {
  constructor(
    @InjectRepository(Context)
    private readonly contextRepo: Repository<Context>,
  ) {}

  /**
   * Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
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
}

