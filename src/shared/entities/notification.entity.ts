import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { User } from '@/shared/entities/user.entity';
import { BaseEntity } from './base.entity';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ORDER_STATUS = 'order_status',
  PAYMENT_STATUS = 'payment_status',
  PROMOTION = 'promotion',
}

@Entity('notifications')
@Index('idx_notifications_user_id', ['user_id'])
@Index('idx_notifications_status', ['status'])
@Index('idx_notifications_type', ['type'])
@Index('idx_notifications_read', ['is_read'])
export class Notification extends BaseEntity {

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @Column({ type: 'json', nullable: true })
  data?: any | null;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'datetime', nullable: true })
  read_at?: Date | null;

  @Column({ type: 'enum', enum: BasicStatus, default: BasicStatus.Active })
  status: BasicStatus;

  // Relationships
  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'created_user_id' })
  created_user?: User;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'updated_user_id' })
  updated_user?: User;
}