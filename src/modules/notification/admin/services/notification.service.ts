import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@/shared/entities/notification.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class NotificationService extends CrudService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository);
  }

  /**
   * Mark notification as read for user
   */
  async markAsReadForUser(id: number, userId: number) {
    const notification = await this.getOne({ id, user_id: userId });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    await this.notificationRepository.update(id, {
      is_read: true,
      read_at: new Date(),
    });
    
    return this.getOne({ id });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsReadForUser(userId: number) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true, read_at: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();
  }
}