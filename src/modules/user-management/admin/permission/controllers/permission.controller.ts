import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { Auth } from '@/common/utils/auth.util';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { PermissionService } from '@/modules/user-management/admin/permission/services/permission.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('admin/permissions')
export class PermissionController {
  constructor(private readonly service: PermissionService) { }

  @Permission('permission.manage')
  @Get()
  async getList(@Query() query: any) {
    const { filters, options } = prepareQuery(query);
    return this.service.getList(filters, options);
  }

  @Permission('permission.manage')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    const { filters, options } = prepareQuery(query);
    return this.service.getSimpleList(filters, options);
  }

  @Permission('permission.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne({ id } as any);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Post()
  async create(@Body() dto: any) {
    const userId = Auth.id() as number;
    return this.service.create(dto, userId);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    const userId = Auth.id() as number;
    return this.service.update(id, dto, userId);
  }

  @Permission('permission.manage')
  @LogRequest()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}



