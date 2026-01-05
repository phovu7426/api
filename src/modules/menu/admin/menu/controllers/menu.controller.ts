import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { MenuService } from '@/modules/menu/admin/menu/services/menu.service';
import { CreateMenuDto } from '@/modules/menu/admin/menu/dtos/create-menu.dto';
import { UpdateMenuDto } from '@/modules/menu/admin/menu/dtos/update-menu.dto';
import { QueryMenuDto } from '@/modules/menu/admin/menu/dtos/query-menu.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/menus')
export class AdminMenuController {
  constructor(
    private readonly service: MenuService,
    private readonly auth: AuthService,
  ) {}

  @Permission('menu.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: QueryMenuDto) {
    const { filters, options } = prepareQuery(query);
    return this.service.getList(filters, options);
  }

  @Permission('menu.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: QueryMenuDto) {
    const { filters, options } = prepareQuery(query);
    return this.service.getSimpleList(filters, options);
  }

  @Permission('menu.manage')
  @Get('tree')
  async getTree() {
    return this.service.getTree();
  }

  @Permission('menu.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne({ id } as any);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    return this.service.create(dto, this.auth.id() || undefined);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto
  ) {
    return this.service.update(id, dto, this.auth.id() || undefined);
  }

  @LogRequest()
  @Permission('menu.manage')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

