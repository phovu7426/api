import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicView } from '@/shared/entities/comic-view.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Chapter } from '@/shared/entities/chapter.entity';

@Injectable()
export class ViewTrackingService {
  constructor(
    @InjectRepository(ComicView) private readonly viewRepo: Repository<ComicView>,
    @InjectRepository(ComicStats) private readonly statsRepo: Repository<ComicStats>,
    @InjectRepository(Chapter) private readonly chapterRepo: Repository<Chapter>,
  ) {}

  /**
   * Track view cho comic/chapter
   * Prevent duplicate views trong 1 giờ (IP + user_id)
   */
  async trackView(data: {
    comic_id: number;
    chapter_id?: number;
    user_id?: number;
    ip?: string;
    user_agent?: string;
  }) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Kiểm tra duplicate view
    const existingView = await this.viewRepo.findOne({
      where: {
        comic_id: data.comic_id,
        chapter_id: data.chapter_id || null,
        user_id: data.user_id || null,
        ip: data.ip || null,
        created_at: { $gte: oneHourAgo } as any,
      } as any,
    });

    if (existingView) {
      return { tracked: false, reason: 'duplicate' };
    }

    // Tạo view record
    const view = this.viewRepo.create({
      comic_id: data.comic_id,
      chapter_id: data.chapter_id || null,
      user_id: data.user_id || null,
      ip: data.ip || null,
      user_agent: data.user_agent || null,
    });

    await this.viewRepo.save(view);

    // Update stats (async, có thể dùng queue)
    await this.updateStats(data.comic_id, data.chapter_id);

    return { tracked: true };
  }

  /**
   * Aggregate views vào comic_stats
   */
  private async updateStats(comicId: number, chapterId?: number) {
    // Update comic view count
    const viewCount = await this.viewRepo.count({
      where: { comic_id: comicId } as any,
    });

    let stats = await this.statsRepo.findOne({ where: { comic_id: comicId } });
    if (!stats) {
      stats = this.statsRepo.create({ comic_id: comicId });
    }
    stats.view_count = viewCount;
    await this.statsRepo.save(stats);

    // Update chapter view count nếu có
    if (chapterId) {
      const chapterViewCount = await this.viewRepo.count({
        where: { chapter_id: chapterId } as any,
      });

      const chapter = await this.chapterRepo.findOne({ where: { id: chapterId } });
      if (chapter) {
        chapter.view_count = chapterViewCount;
        await this.chapterRepo.save(chapter);
      }
    }
  }
}



