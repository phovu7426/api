import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingHistory } from '@/shared/entities/reading-history.entity';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { Bookmark } from '@/shared/entities/bookmark.entity';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ReadingHistory) private readonly historyRepo: Repository<ReadingHistory>,
    @InjectRepository(ComicFollow) private readonly followRepo: Repository<ComicFollow>,
    @InjectRepository(Bookmark) private readonly bookmarkRepo: Repository<Bookmark>,
  ) {}

  /**
   * Lấy dashboard data cho user
   */
  async getDashboard(userId: number) {
    const [readingHistory, follows, bookmarks] = await Promise.all([
      this.historyRepo.find({
        where: { user_id: userId } as any,
        relations: ['comic', 'chapter'],
        order: { updated_at: 'DESC' },
        take: 10,
      }),
      this.followRepo.find({
        where: { user_id: userId } as any,
        relations: ['comic'],
        order: { created_at: 'DESC' },
        take: 10,
      }),
      this.bookmarkRepo.find({
        where: { user_id: userId } as any,
        relations: ['chapter', 'comic'],
        order: { created_at: 'DESC' },
        take: 10,
      }),
    ]);

    return {
      reading_history: readingHistory,
      follows: follows,
      bookmarks: bookmarks,
      stats: {
        reading_count: await this.historyRepo.count({ where: { user_id: userId } as any }),
        follow_count: await this.followRepo.count({ where: { user_id: userId } as any }),
        bookmark_count: await this.bookmarkRepo.count({ where: { user_id: userId } as any }),
      },
    };
  }

  /**
   * Lấy library (tất cả comics user đã đọc/follow)
   */
  async getLibrary(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Lấy từ reading history
    const [history, total] = await this.historyRepo.findAndCount({
      where: { user_id: userId } as any,
      relations: ['comic', 'chapter'],
      order: { updated_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: history.map(h => ({
        comic: h.comic,
        last_read_chapter: h.chapter,
        last_read_at: h.updated_at,
        last_page: h.last_page,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}



