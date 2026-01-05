import { Controller, Get } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { UserContextService } from '../services/context.service';

@Controller('user/contexts')
export class ContextController {
  constructor(
    private readonly contextService: UserContextService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Lấy các contexts được phép truy cập
   * - System context (id=1) luôn được phép cho mọi user đã authenticated
   * - Các contexts khác chỉ được phép nếu user có role trong đó
   */
  @Permission('public')
  @Get()
  async getUserContexts() {
    const userId = this.auth.id();
    if (!userId) {
      return [];
    }

    const contexts = await this.contextService.getUserContextsForTransfer(userId);
    return contexts.map(ctx => ({
      id: ctx.id.toString(),
      type: ctx.type,
      ref_id: ctx.ref_id?.toString() || null,
      name: ctx.name,
    }));
  }

}

