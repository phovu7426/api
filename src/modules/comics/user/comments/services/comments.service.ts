import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { RequestContext } from '@/common/utils/request-context.util';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Injectable()
export class UserCommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    private readonly notificationService: ComicNotificationService,
  ) {}

  /**
   * Tạo comment hoặc reply
   */
  async create(data: {
    comic_id: number;
    chapter_id?: number;
    parent_id?: number;
    content: string;
  }) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    // Validate parent_id nếu có
    if (data.parent_id) {
      const parent = await this.repo.findOne({ where: { id: data.parent_id } });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      // Đảm bảo parent comment cùng comic_id
      if (parent.comic_id !== data.comic_id) {
        throw new BadRequestException('Parent comment must be from the same comic');
      }
    }

    const comment = this.repo.create({
      user_id: userId,
      comic_id: data.comic_id,
      chapter_id: data.chapter_id || null,
      parent_id: data.parent_id || null,
      content: data.content,
      status: 'visible',
      created_user_id: userId,
    });

    const saved = await this.repo.save(comment);

    // Notify nếu là reply
    if (data.parent_id) {
      await this.notificationService.notifyCommentReply(saved.id, data.parent_id, userId);
    }

    return saved;
  }

  /**
   * Cập nhật comment
   */
  async update(commentId: number, content: string) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const comment = await this.repo.findOne({
      where: { id: commentId, user_id: userId } as any,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.content = content;
    comment.updated_user_id = userId;

    return this.repo.save(comment);
  }

  /**
   * Xóa comment (soft delete)
   */
  async delete(commentId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const comment = await this.repo.findOne({
      where: { id: commentId, user_id: userId } as any,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.repo.softRemove(comment);
    return { deleted: true };
  }

  /**
   * Lấy comments của user
   */
  async getByUser(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { user_id: userId } as any,
      relations: ['comic', 'chapter'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

