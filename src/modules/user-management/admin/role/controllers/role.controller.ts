import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { AuthService } from '@/common/services/auth.service';
import { RoleService } from '@/modules/user-management/admin/role/services/role.service';

@Controller('admin/roles')
export class RoleController {
  constructor(
    private readonly service: RoleService,
    private readonly auth: AuthService,
  ) { }

  @Permission('role.manage')
  @Get()
  async getList(@Query() query: any) {
    // Tách pagination options ra khỏi filters
    const { page, limit, sort, ...filters } = query;
    return this.service.getList(filters, { page, limit, sort });
  }

  @Permission('role.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    // Tách pagination options ra khỏi filters
    const { page, limit, sort, ...filters } = query;
    return this.service.getSimpleList(filters, { page, limit, sort });
  }

  @Permission('role.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne({ id } as any, {
      relations: [
        'parent',
        'children',
        'permissions',
        'role_contexts',
        'role_contexts.context',
      ]
    });
  }

  @LogRequest()
  @Permission('role.manage')
  @Post()
  async create(@Body() dto: any) {
    // Sử dụng AuthService thay vì @Req() decorator
    const userId = this.auth.id();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.service.create(dto, userId);
  }

  @LogRequest()
  @Permission('role.manage')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    // Sử dụng AuthService trong hàm
    if (!this.auth.isLogin()) {
      throw new Error('User not authenticated');
    }
    const userId = this.auth.id();
    return this.service.update(id, dto, userId!);
  }

  @LogRequest()
  @Permission('role.manage')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @LogRequest()
  @Permission('role.manage')
  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { permission_ids: number[] }
  ) {
    return this.service.assignPermissions(roleId, body.permission_ids || []);
  }
}



