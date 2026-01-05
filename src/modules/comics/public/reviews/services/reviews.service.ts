import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicReview } from '@/shared/entities/comic-review.entity';

@Injectable()
export class PublicReviewsService {
  constructor(
    @InjectRepository(ComicReview) private readonly repo: Repository<ComicReview>,
  ) {}

  /**
   * Lấy danh sách reviews của comic
   */
  async getByComic(comicId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { comic_id: comicId } as any,
      relations: ['user'],
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



