import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@/shared/entities/notification.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { Comment } from '@/shared/entities/comment.entity';
import { Chapter } from '@/shared/entities/chapter.entity';
import { Comic } from '@/shared/entities/comic.entity';
import { NotificationType } from '@/shared/entities/notification.entity';

@Injectable()
export class ComicNotificationService {
  private get commentRepo(): Repository<Comment> {
    return this.notificationRepo.manager.getRepository(Comment);
  }

  constructor(
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(ComicFollow) private readonly followRepo: Repository<ComicFollow>,
  ) {}

  /**
   * Notify followers khi có chapter mới được publish
   */
  async notifyNewChapter(chapter: Chapter) {
    if (!chapter.comic_id) {
      return;
    }

    // Lấy tất cả followers của comic
    const followers = await this.followRepo.find({
      where: { comic_id: chapter.comic_id } as any,
      relations: ['comic'],
    });

    if (followers.length === 0) {
      return;
    }

    const comic = followers[0].comic;
    if (!comic) {
      return;
    }

    // Tạo notifications cho từng follower
    const notifications = followers.map(follow =>
      this.notificationRepo.create({
        user_id: follow.user_id,
        title: `Chapter mới: ${chapter.title}`,
        message: `${comic.title} đã có chapter mới: ${chapter.chapter_label || chapter.chapter_index}`,
        type: NotificationType.INFO,
        data: {
          comic_id: comic.id,
          comic_slug: comic.slug,
          comic_title: comic.title,
          chapter_id: chapter.id,
          chapter_index: chapter.chapter_index,
          chapter_label: chapter.chapter_label,
        },
        is_read: false,
      })
    );

    await this.notificationRepo.save(notifications);

    return { notified: notifications.length };
  }

  /**
   * Notify user khi có comment reply
   */
  async notifyCommentReply(commentId: number, parentCommentId: number, userId: number) {
    // Lấy parent comment để biết user cần notify
    const parentComment = await this.commentRepo.findOne({ where: { id: parentCommentId } });

    if (!parentComment || parentComment.user_id === userId) {
      return; // Không notify chính mình
    }

    const notification = this.notificationRepo.create({
      user_id: parentComment.user_id,
      title: 'Có người trả lời bình luận của bạn',
      message: 'Bạn có một phản hồi mới cho bình luận của bạn',
      type: NotificationType.INFO,
      data: {
        comment_id: commentId,
        parent_comment_id: parentCommentId,
      },
      is_read: false,
    });

    await this.notificationRepo.save(notification);
    return notification;
  }
}

