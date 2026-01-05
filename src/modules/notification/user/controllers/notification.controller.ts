import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { NotificationService } from '@/modules/notification/admin/services/notification.service';
import { GetNotificationsDto } from '@/modules/notification/user/dtos/get-notifications.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Controller('user/notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @Permission('notification.manage')
  async getList(
    @Request() req: { user: AuthUser },
    @Query() query: GetNotificationsDto,
  ) {
    const { filters, options } = prepareQuery(query);
    return this.notificationService.getList(filters, options);
  }

  @Get('unread')
  @Permission('notification.manage')
  async getUnread(@Request() req: { user: AuthUser }) {
    return this.notificationService.getList({ is_read: false });
  }

  @Get('unread/count')
  @Permission('notification.manage')
  async getUnreadCount(@Request() req: { user: AuthUser }) {
    const result = await this.notificationService.getList(
      { user_id: req.user.id, is_read: false, status: BasicStatus.Active },
      { page: 1, limit: 1 }
    );
    return { success: true, data: { count: result.meta?.totalItems || 0 }, message: 'Unread count retrieved successfully' };
  }

  @Get(':id')
  @Permission('notification.manage')
  async getOne(
    @Param('id') id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.notificationService.getOne({ id: +id, user_id: req.user.id });
  }

  @LogRequest()
  @Patch(':id/read')
  @Permission('notification.manage')
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: AuthUser },
  ) {
    return this.notificationService.markAsReadForUser(+id, req.user.id);
  }

  @LogRequest()
  @Patch('read-all')
  @Permission('notification.manage')
  async markAllAsRead(@Request() req: { user: AuthUser }) {
    return this.notificationService.markAllAsReadForUser(req.user.id);
  }
}