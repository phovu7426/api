import { Module } from '@nestjs/common';
import { NotificationService } from '@/modules/notification/admin/services/notification.service';
import { NotificationController as AdminNotificationController } from '@/modules/notification/admin/controllers/notification.controller';
import { NotificationController as UserNotificationController } from '@/modules/notification/user/controllers/notification.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [AdminNotificationController, UserNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }