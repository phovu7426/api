import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicReview } from '@/shared/entities/comic-review.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class ReviewsService extends CrudService<ComicReview> {
  constructor(
    @InjectRepository(ComicReview) protected readonly repo: Repository<ComicReview>,
  ) {
    super(repo);
  }

  /**
   * Override để load relations trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['user', 'comic', 'created_user', 'updated_user'],
    } as any;
  }

  /**
   * Get list với filter và search
   */
  async getList(filters: any = {}, options: any = {}) {
    const queryBuilder = this.repo.createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.comic', 'comic')
      .leftJoinAndSelect('review.created_user', 'created_user')
      .leftJoinAndSelect('review.updated_user', 'updated_user');

    // Filter by comic_id
    if (filters.comic_id) {
      queryBuilder.andWhere('review.comic_id = :comic_id', { comic_id: filters.comic_id });
    }

    // Filter by user_id
    if (filters.user_id) {
      queryBuilder.andWhere('review.user_id = :user_id', { user_id: filters.user_id });
    }

    // Filter by rating
    if (filters.rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating: filters.rating });
    }

    // Filter by rating range
    if (filters.rating_min) {
      queryBuilder.andWhere('review.rating >= :rating_min', { rating_min: filters.rating_min });
    }
    if (filters.rating_max) {
      queryBuilder.andWhere('review.rating <= :rating_max', { rating_max: filters.rating_max });
    }

    // Search by content
    if (filters.search) {
      queryBuilder.andWhere('review.content LIKE :search', { search: `%${filters.search}%` });
    }

    // Filter by date range
    if (filters.date_from) {
      queryBuilder.andWhere('review.created_at >= :date_from', { date_from: filters.date_from });
    }
    if (filters.date_to) {
      queryBuilder.andWhere('review.created_at <= :date_to', { date_to: filters.date_to });
    }

    // Sort
    const sort = options.sort || 'created_at:DESC';
    const [sortField, sortOrder] = sort.split(':');
    queryBuilder.orderBy(`review.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
      },
    };
  }

  /**
   * Get one với relations
   */
  override async getOne(where: any, options?: any): Promise<ComicReview | null> {
    const adminOptions = {
      ...options,
      relations: ['user', 'comic', 'created_user', 'updated_user'],
    };
    return super.getOne(where, adminOptions);
  }

  /**
   * Update review
   */
  async update(id: number, data: { content?: string; rating?: number }) {
    const review = await this.getOne({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (data.content !== undefined) {
      review.content = data.content;
    }
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      review.rating = data.rating;
    }

    return this.repo.save(review);
  }

  /**
   * Delete review (soft delete)
   */
  async delete(id: number) {
    const review = await this.getOne({ id });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.repo.softRemove(review);
    return { deleted: true };
  }

  /**
   * Restore review
   */
  async restore(id: number) {
    const review = await this.repo.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.repo.restore(id);
    await this.getOne({ id });
    return { restored: true };
  }

  /**
   * Get review statistics
   */
  async getStatistics() {
    const total = await this.repo.count();
    const today = await this.repo
      .createQueryBuilder('review')
      .where('DATE(review.created_at) = CURDATE()')
      .getCount();
    const thisWeek = await this.repo
      .createQueryBuilder('review')
      .where('YEARWEEK(review.created_at) = YEARWEEK(CURDATE())')
      .getCount();
    const thisMonth = await this.repo
      .createQueryBuilder('review')
      .where('YEAR(review.created_at) = YEAR(CURDATE()) AND MONTH(review.created_at) = MONTH(CURDATE())')
      .getCount();

    // Average rating
    const avgRating = await this.repo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    // Rating distribution
    const ratingDistribution = await this.repo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .groupBy('review.rating')
      .orderBy('review.rating', 'ASC')
      .getRawMany();

    return {
      total,
      today,
      this_week: thisWeek,
      this_month: thisMonth,
      average_rating: parseFloat(avgRating?.avg || '0'),
      rating_distribution: ratingDistribution.map(r => ({
        rating: parseInt(r.rating),
        count: parseInt(r.count),
      })),
    };
  }
}

