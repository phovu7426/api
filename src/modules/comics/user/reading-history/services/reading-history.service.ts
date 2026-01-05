import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingHistory } from '@/shared/entities/reading-history.entity';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class ReadingHistoryService {
  constructor(
    @InjectRepository(ReadingHistory) private readonly repo: Repository<ReadingHistory>,
  ) {}

  async getByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['comic', 'chapter'],
      order: { updated_at: 'DESC' },
    });
  }

  async updateOrCreate(comicId: number, chapterId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const existing = await this.repo.findOne({
      where: { user_id: userId, comic_id: comicId },
    });

    if (existing) {
      existing.chapter_id = chapterId;
      return this.repo.save(existing);
    }

    const newHistory = this.repo.create({
      user_id: userId,
      comic_id: comicId,
      chapter_id: chapterId,
    });
    return this.repo.save(newHistory);
  }

  async delete(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.repo.delete({ user_id: userId, comic_id: comicId });
    return { deleted: true };
  }
}



