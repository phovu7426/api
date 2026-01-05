import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class CommentsService extends CrudService<Comment> {
  constructor(
    @InjectRepository(Comment) protected readonly repo: Repository<Comment>,
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
      relations: ['user', 'comic', 'chapter', 'parent', 'replies', 'created_user', 'updated_user'],
    } as any;
  }

  /**
   * Get list với filter và search
   */
  async getList(filters: any = {}, options: any = {}) {
    const queryBuilder = this.repo.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.comic', 'comic')
      .leftJoinAndSelect('comment.chapter', 'chapter')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('comment.created_user', 'created_user')
      .leftJoinAndSelect('comment.updated_user', 'updated_user');

    // Filter by comic_id
    if (filters.comic_id) {
      queryBuilder.andWhere('comment.comic_id = :comic_id', { comic_id: filters.comic_id });
    }

    // Filter by chapter_id
    if (filters.chapter_id) {
      queryBuilder.andWhere('comment.chapter_id = :chapter_id', { chapter_id: filters.chapter_id });
    }

    // Filter by user_id
    if (filters.user_id) {
      queryBuilder.andWhere('comment.user_id = :user_id', { user_id: filters.user_id });
    }

    // Filter by status
    if (filters.status) {
      queryBuilder.andWhere('comment.status = :status', { status: filters.status });
    }

    // Filter by parent_id (null = top-level comments)
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null || filters.parent_id === 'null') {
        queryBuilder.andWhere('comment.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('comment.parent_id = :parent_id', { parent_id: filters.parent_id });
      }
    }

    // Search by content
    if (filters.search) {
      queryBuilder.andWhere('comment.content LIKE :search', { search: `%${filters.search}%` });
    }

    // Filter by date range
    if (filters.date_from) {
      queryBuilder.andWhere('comment.created_at >= :date_from', { date_from: filters.date_from });
    }
    if (filters.date_to) {
      queryBuilder.andWhere('comment.created_at <= :date_to', { date_to: filters.date_to });
    }

    // Sort
    const sort = options.sort || 'created_at:DESC';
    const [sortField, sortOrder] = sort.split(':');
    queryBuilder.orderBy(`comment.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

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
  override async getOne(where: any, options?: any): Promise<Comment | null> {
    const adminOptions = {
      ...options,
      relations: ['user', 'comic', 'chapter', 'parent', 'replies', 'created_user', 'updated_user'],
    };
    return super.getOne(where, adminOptions);
  }

  /**
   * Update comment
   */
  async update(id: number, data: { content?: string; status?: 'visible' | 'hidden' }) {
    const comment = await this.getOne({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (data.content !== undefined) {
      comment.content = data.content;
    }
    if (data.status !== undefined) {
      comment.status = data.status;
    }

    return this.repo.save(comment);
  }

  /**
   * Delete comment (soft delete)
   */
  async delete(id: number) {
    const comment = await this.getOne({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Soft delete comment và tất cả replies
    await this.repo.softRemove(comment);
    
    // Soft delete all replies
    await this.repo
      .createQueryBuilder()
      .softDelete()
      .where('parent_id = :parent_id', { parent_id: id })
      .execute();

    return { deleted: true };
  }

  /**
   * Restore comment
   */
  async restore(id: number) {
    const comment = await this.repo.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.repo.restore(id);
    await this.getOne({ id });
    return { restored: true };
  }

  /**
   * Get comment statistics
   */
  async getStatistics() {
    const total = await this.repo.count();
    const visible = await this.repo.count({ where: { status: 'visible' } as any });
    const hidden = await this.repo.count({ where: { status: 'hidden' } as any });
    const today = await this.repo
      .createQueryBuilder('comment')
      .where('DATE(comment.created_at) = CURDATE()')
      .getCount();
    const thisWeek = await this.repo
      .createQueryBuilder('comment')
      .where('YEARWEEK(comment.created_at) = YEARWEEK(CURDATE())')
      .getCount();
    const thisMonth = await this.repo
      .createQueryBuilder('comment')
      .where('YEAR(comment.created_at) = YEAR(CURDATE()) AND MONTH(comment.created_at) = MONTH(CURDATE())')
      .getCount();

    return {
      total,
      visible,
      hidden,
      today,
      this_week: thisWeek,
      this_month: thisMonth,
    };
  }
}

