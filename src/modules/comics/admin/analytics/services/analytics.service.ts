import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicView } from '@/shared/entities/comic-view.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Comic) private readonly comicRepo: Repository<Comic>,
    @InjectRepository(ComicStats) private readonly statsRepo: Repository<ComicStats>,
    @InjectRepository(ComicView) private readonly viewRepo: Repository<ComicView>,
  ) {}

  /**
   * Dashboard analytics
   */
  async getDashboard() {
    const [totalComics, totalViews, totalFollows, topComics] = await Promise.all([
      this.comicRepo.count(),
      this.statsRepo
        .createQueryBuilder('stats')
        .select('SUM(stats.view_count)', 'total')
        .getRawOne(),
      this.statsRepo
        .createQueryBuilder('stats')
        .select('SUM(stats.follow_count)', 'total')
        .getRawOne(),
      this.statsRepo.find({
        order: { view_count: 'DESC' },
        take: 10,
        relations: ['comic'],
      }),
    ]);

    return {
      total_comics: totalComics,
      total_views: parseInt(totalViews?.total || '0'),
      total_follows: parseInt(totalFollows?.total || '0'),
      top_comics: topComics.map(s => ({
        comic: s.comic,
        stats: s,
      })),
    };
  }

  /**
   * Top comics
   */
  async getTopComics(limit: number = 20, sortBy: 'views' | 'follows' | 'rating' = 'views') {
    const orderBy: any = sortBy === 'views' 
      ? { view_count: 'DESC' }
      : sortBy === 'follows'
      ? { follow_count: 'DESC' }
      : { rating_sum: 'DESC' };

    const stats = await this.statsRepo.find({
      order: orderBy,
      take: limit,
      relations: ['comic'],
    });

    return stats.map(s => ({
      comic: s.comic,
      stats: s,
    }));
  }

  /**
   * Views over time
   */
  async getViewsOverTime(startDate: Date, endDate: Date) {
    const views = await this.viewRepo.find({
      where: {
        created_at: Between(startDate, endDate),
      } as any,
      order: { created_at: 'ASC' },
    });

    // Group by date
    const grouped = views.reduce((acc, view) => {
      const date = view.created_at.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));
  }
}

