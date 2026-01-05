import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ListService } from '@/common/base/services/list.service';
import { PUBLIC_COMIC_STATUSES, PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';
import { PaginatedListResult } from '@/common/base/interfaces/list.interface';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

@Injectable()
export class PublicComicsService extends ListService<Comic> {
  private get statsRepo(): Repository<ComicStats> {
    return this.repository.manager.getRepository(ComicStats);
  }

  private get chapterRepo(): Repository<Chapter> {
    return this.repository.manager.getRepository(Chapter);
  }

  constructor(
    @InjectRepository(Comic) protected readonly repo: Repository<Comic>,
  ) {
    super(repo);
  }

  /**
   * Override getList để hỗ trợ sort theo stats.view_count và stats.follow_count
   */
  async getList(
    filters?: any,
    options?: any,
  ): Promise<PaginatedListResult<Comic>> {
    const normalizedOptions = this.prepareOptions(options || {});
    const page = normalizedOptions.page || 1;
    const limit = normalizedOptions.limit || 10;
    const sort = normalizedOptions.sort || 'id:DESC';

    // Parse sort để kiểm tra xem có sort theo stats fields không
    const sortArray = Array.isArray(sort) ? sort : [sort];
    const sortItem = sortArray[0];
    let sortField = '';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';

    if (typeof sortItem === 'string') {
      const [field, direction] = sortItem.split(':');
      sortField = (field || '').trim();
      sortDirection = (direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    // Nếu sort theo stats fields (view_count, follow_count), dùng QueryBuilder
    if (sortField === 'view_count' || sortField === 'follow_count') {
      return this.getListWithStatsSort(filters, normalizedOptions, sortField, sortDirection);
    }

    // Nếu không, dùng method mặc định của ListService
    return super.getList(filters, options);
  }

  /**
   * Lấy danh sách với sort theo stats fields
   */
  private async getListWithStatsSort(
    filters?: any,
    options?: any,
    sortField: string = 'view_count',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginatedListResult<Comic>> {
    const normalizedOptions = this.prepareOptions(options || {});
    const page = normalizedOptions.page || 1;
    const limit = normalizedOptions.limit || 10;

    // Prepare filters
    const preparedResult = this.prepareFilters(filters, normalizedOptions);
    const prepared = preparedResult instanceof Promise ? await preparedResult : preparedResult;
    
    if (!prepared) {
      return {
        data: [],
        meta: createPaginationMeta(page, limit, 0),
      };
    }

    const whereFilters = (prepared === true ? filters : prepared) as any;

    // Build query với QueryBuilder để sort theo stats
    const queryBuilder = this.repository
      .createQueryBuilder('comic')
      .leftJoinAndSelect('comic.stats', 'stats')
      .leftJoinAndSelect('comic.categories', 'categories')
      .where('comic.status IN (:...statuses)', { statuses: PUBLIC_COMIC_STATUSES });

    // Apply các filters khác (trừ status đã set ở trên)
    if (whereFilters) {
      Object.keys(whereFilters).forEach((key) => {
        if (key !== 'status' && whereFilters[key] !== undefined) {
          if (Array.isArray(whereFilters[key])) {
            queryBuilder.andWhere(`comic.${key} IN (:...${key})`, { [key]: whereFilters[key] });
          } else {
            queryBuilder.andWhere(`comic.${key} = :${key}`, { [key]: whereFilters[key] });
          }
        }
      });
    }

    // Sort theo stats field
    queryBuilder.orderBy(`stats.${sortField}`, sortDirection);
    // Fallback sort để đảm bảo kết quả ổn định
    queryBuilder.addOrderBy('comic.id', 'DESC');

    // Pagination
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [rows, total] = await queryBuilder.getManyAndCount();

    return {
      data: rows,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Override để chỉ lấy comics có status public
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };
    // TypeORM tự động convert array thành IN clause
    prepared.status = PUBLIC_COMIC_STATUSES;
    return prepared;
  }

  /**
   * Override để load relations
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['categories', 'stats'],
    } as any;
  }

  /**
   * Lấy danh sách chapters của comic
   */
  async getChaptersBySlug(slug: string) {
    const comic = await this.repo.findOne({ where: { slug } });
    if (!comic) {
      return [];
    }

    return this.chapterRepo.find({
      where: { comic_id: comic.id, status: PUBLIC_CHAPTER_STATUSES[0] } as any,
      order: { chapter_index: 'ASC' },
      select: ['id', 'title', 'chapter_index', 'chapter_label', 'view_count', 'created_at'],
    });
  }

  /**
   * Lấy trending comics (theo view_count trong stats)
   */
  async getTrending(limit: number = 20) {
    const stats = await this.statsRepo.find({
      order: { view_count: 'DESC' },
      take: limit,
      relations: ['comic'],
    });

    return stats
      .map(s => s.comic)
      .filter((c): c is Comic => !!c && PUBLIC_COMIC_STATUSES.includes(c.status))
      .map(comic => ({
        ...comic,
        stats: stats.find(s => s.comic_id === comic.id),
      }));
  }

  /**
   * Lấy popular comics (theo follow_count trong stats)
   */
  async getPopular(limit: number = 20) {
    const stats = await this.statsRepo.find({
      order: { follow_count: 'DESC' },
      take: limit,
      relations: ['comic'],
    });

    return stats
      .map(s => s.comic)
      .filter((c): c is Comic => !!c && PUBLIC_COMIC_STATUSES.includes(c.status))
      .map(comic => ({
        ...comic,
        stats: stats.find(s => s.comic_id === comic.id),
      }));
  }

  /**
   * Lấy newest comics
   */
  async getNewest(limit: number = 20) {
    return this.repo.find({
      where: { status: PUBLIC_COMIC_STATUSES[0] } as any,
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['categories', 'stats'],
    });
  }
}

