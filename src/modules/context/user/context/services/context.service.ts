import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class UserContextService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
   */
  async getUserContexts(userId: number): Promise<any[]> {
    const contexts = await this.prisma.context.findMany({
      where: {
        status: 'active',
        groups: {
          some: {
            status: 'active',
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
    if (systemContext) {
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
}
