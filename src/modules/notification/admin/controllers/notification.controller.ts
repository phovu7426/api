import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { NotificationService } from '@/modules/notification/admin/services/notification.service';
import { CreateNotificationDto } from '@/modules/notification/admin/dtos/create-notification.dto';
import { UpdateNotificationDto } from '@/modules/notification/admin/dtos/update-notification.dto';
import { GetNotificationsDto } from '@/modules/notification/admin/dtos/get-notifications.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @LogRequest()
  @Post()
  @Permission('notification.manage')
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  @Permission('notification.manage')
  async getList(@Query() query: GetNotificationsDto) {
    const { filters, options } = prepareQuery(query);
    return this.notificationService.getList(filters, { ...options, sort: 'created_at:DESC' });
  }

  @Get('simple')
  @Permission('notification.manage')
  async getSimpleList(@Query() query: GetNotificationsDto) {
    const { filters, options } = prepareQuery(query);
    return this.notificationService.getSimpleList(filters, { ...options, sort: 'created_at:DESC' });
  }

  @Get(':id')
  @Permission('notification.manage')
  async getOne(@Param('id') id: string) {
    return this.notificationService.getOne({ id: +id });
  }

  @LogRequest()
  @Patch(':id')
  @Permission('notification.manage')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(+id, dto);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('notification.manage')
  async delete(@Param('id') id: string) {
    return this.notificationService.delete(+id);
  }

  @LogRequest()
  @Patch(':id/restore')
  @Permission('notification.manage')
  async restore(@Param('id') id: string) {
    return this.notificationService.restore(+id);
  }
}