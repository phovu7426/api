import { IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { NotificationType } from '@/shared/entities/notification.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class GetNotificationsDto {
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean;
}