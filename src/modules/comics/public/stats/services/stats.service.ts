import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicView } from '@/shared/entities/comic-view.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(ComicStats) private readonly statsRepo: Repository<ComicStats>,
    @InjectRepository(Comic) private readonly comicRepo: Repository<Comic>,
  ) {}

  /**
   * Lấy stats của comic
   */
  async getComicStats(comicId: number) {
    const comic = await this.comicRepo.findOne({ where: { id: comicId } });
    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    const stats = await this.statsRepo.findOne({ where: { comic_id: comicId } });
    
    return {
      comic_id: comicId,
      view_count: stats?.view_count || 0,
      follow_count: stats?.follow_count || 0,
      rating_count: stats?.rating_count || 0,
      rating_average: stats && stats.rating_count > 0 
        ? (stats.rating_sum / stats.rating_count).toFixed(2) 
        : '0',
    };
  }
}

