import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { NotificationType } from '@/shared/entities/notification.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

export class CreateNotificationDto {
  @IsNumber()
  user_id: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsEnum(BasicStatus)
  status?: BasicStatus;

  @IsOptional()
  @IsNumber()
  created_user_id?: number;
}