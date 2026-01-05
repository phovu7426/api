import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@/shared/entities/notification.entity';
import { NotificationService } from '@/modules/notification/admin/services/notification.service';
import { NotificationController as AdminNotificationController } from '@/modules/notification/admin/controllers/notification.controller';
import { NotificationController as UserNotificationController } from '@/modules/notification/user/controllers/notification.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    RbacModule,
  ],
  controllers: [AdminNotificationController, UserNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }