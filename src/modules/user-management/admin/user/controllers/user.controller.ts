import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from '@/modules/user-management/admin/user/services/user.service';
import { CreateUserDto } from '@/modules/user-management/admin/user/dtos/create-user.dto';
import { UpdateUserDto } from '@/modules/user-management/admin/user/dtos/update-user.dto';
import { ChangePasswordDto } from '@/modules/user-management/admin/user/dtos/change-password.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('admin/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Permission('user.manage')
  @Get()
  getList(@Query() query: any) {
    const { filters, options } = prepareQuery(query);
    return this.service.getList(filters, options);
  }

  @Permission('user.manage')
  @Get('simple')
  getSimpleList(@Query() query: any) {
    const { filters, options } = prepareQuery(query);
    return this.service.getSimpleList(filters, options);
  }

  @Permission('user.manage')
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne({ id: Number(id) } as any);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_create' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    // Dto không map 1-1 với entity (profile payload khác type), service đã xử lý trong hook
    return this.service.create(dto as any);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_update' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // Dto không map 1-1 với entity, service sẽ chuẩn hóa trong hooks
    return this.service.update(Number(id), dto as any);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_change_password' })
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(Number(id), dto);
  }

  @Permission('user.manage')
  @LogRequest({ fileBaseName: 'user_delete' })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}


