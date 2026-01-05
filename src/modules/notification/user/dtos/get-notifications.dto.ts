import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { NotificationType } from '@/shared/entities/notification.entity';

export class GetNotificationsDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;
}