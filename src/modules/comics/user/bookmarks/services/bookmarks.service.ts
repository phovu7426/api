import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '@/shared/entities/bookmark.entity';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark) private readonly repo: Repository<Bookmark>,
  ) {}

  async getByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['chapter'],
      order: { created_at: 'DESC' },
    });
  }

  async create(chapterId: number, pageNumber: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const bookmark = this.repo.create({
      user_id: userId,
      chapter_id: chapterId,
      page_number: pageNumber,
    });
    return this.repo.save(bookmark);
  }

  async delete(id: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.repo.delete({ id, user_id: userId });
    return { deleted: true };
  }
}



