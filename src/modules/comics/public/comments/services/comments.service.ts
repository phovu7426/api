import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

@Injectable()
export class PublicCommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
  ) {}

  /**
   * Lấy comments của comic (tree structure)
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    // Lấy top-level comments (không có parent_id)
    const topLevelComments = await this.repo.find({
      where: {
        comic_id: comicId,
        chapter_id: null,
        parent_id: null,
        status: 'visible',
      } as any,
      relations: ['user', 'replies'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Load replies cho mỗi comment
    for (const comment of topLevelComments) {
      if (comment.replies) {
        comment.replies = await this.repo.find({
          where: { parent_id: comment.id, status: 'visible' } as any,
          relations: ['user'],
          order: { created_at: 'ASC' },
        });
      }
    }

    const total = await this.repo.count({
      where: {
        comic_id: comicId,
        chapter_id: null,
        parent_id: null,
        status: 'visible',
      } as any,
    });

    return {
      data: topLevelComments,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Lấy comments của chapter (tree structure)
   */
  async getByChapter(chapterId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const topLevelComments = await this.repo.find({
      where: {
        chapter_id: chapterId,
        parent_id: null,
        status: 'visible',
      } as any,
      relations: ['user', 'replies'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Load replies
    for (const comment of topLevelComments) {
      if (comment.replies) {
        comment.replies = await this.repo.find({
          where: { parent_id: comment.id, status: 'visible' } as any,
          relations: ['user'],
          order: { created_at: 'ASC' },
        });
      }
    }

    const total = await this.repo.count({
      where: {
        chapter_id: chapterId,
        parent_id: null,
        status: 'visible',
      } as any,
    });

    return {
      data: topLevelComments,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}



