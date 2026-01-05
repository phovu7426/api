import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, ForbiddenException, Query } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { AdminContextService } from '../services/context.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

/**
 * Controller cho System Admin quản lý Contexts
 * Routes: /api/admin/contexts
 */
@Controller('admin/contexts')
export class AdminContextController {
  constructor(
    private readonly contextService: AdminContextService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Tạo context mới (chỉ system admin)
   */
  @Permission('group.manage')
  @Post()
  async createContext(@Body() body: {
    type: string;
    ref_id?: number | null;
    name: string;
    code?: string;
    status?: string;
  }) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.contextService.createContext(body, userId);
  }

  /**
   * Lấy danh sách tất cả contexts (chuẩn phân trang hệ thống)
   * - Hỗ trợ query chuẩn: page, limit, sort
   * - Hỗ trợ filters[type], filters[status], ...
   */
  @Permission('public')
  @Get()
  async getContexts(@Query() query: any) {
    const { filters, options } = prepareQuery(query);

    // Backward-compatible: vẫn cho phép ?type=shop
    if (query.type && !filters.type) {
      (filters as any).type = query.type;
    }

    return this.contextService.getList(filters, options);
  }

  /**
   * Lấy context theo ID
   */
  @Permission('public')
  @Get(':id')
  async getContext(@Param('id', ParseIntPipe) id: number) {
    return this.contextService.findById(id);
  }

  /**
   * Update context (chỉ system admin)
   */
  @Permission('group.manage')
  @Put(':id')
  async updateContext(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ name: string; code: string; status: string }>,
  ) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    return this.contextService.updateContext(id, body, userId);
  }

  /**
   * Xóa context (chỉ system admin)
   */
  @Permission('group.manage')
  @Delete(':id')
  async deleteContext(@Param('id', ParseIntPipe) id: number) {
    const userId = this.auth.id();
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    await this.contextService.deleteContext(id);
    return { message: 'Context deleted successfully' };
  }
}

