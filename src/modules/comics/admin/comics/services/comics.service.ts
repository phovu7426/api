import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';

@Injectable()
export class ComicsService extends CrudService<Comic> {
  private get categoryRepo(): Repository<ComicCategory> {
    return this.repository.manager.getRepository(ComicCategory);
  }

  private get statsRepo(): Repository<ComicStats> {
    return this.repository.manager.getRepository(ComicStats);
  }

  constructor(
    @InjectRepository(Comic) protected readonly repo: Repository<Comic>,
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
      relations: ['categories', 'stats'],
    } as any;
  }

  /**
   * Transform data sau khi lấy danh sách
   */
  protected async afterGetList(
    data: Comic[],
    filters?: any,
    options?: any
  ): Promise<Comic[]> {
    return data.map(comic => {
      if (comic.categories) {
        comic.categories = comic.categories.map(cat => {
          const { id, name, slug } = cat;
          return { id, name, slug } as any;
        });
      }
      return comic;
    });
  }

  /**
   * Transform data sau khi lấy một entity
   */
  protected async afterGetOne(
    entity: Comic,
    where?: any,
    options?: any
  ): Promise<Comic> {
    if (entity.categories) {
      entity.categories = entity.categories.map(cat => {
        const { id, name, slug } = cat;
        return { id, name, slug } as any;
      });
    }
    return entity;
  }

  /**
   * Hook trước khi tạo - xử lý slug và quan hệ
   */
  protected async beforeCreate(entity: Comic, createDto: DeepPartial<Comic>): Promise<boolean> {
    await this.ensureSlug(createDto);

    // Xử lý categories
    const categoryIds = (createDto as any).category_ids as number[] | undefined;
    const hasCategoryIds = categoryIds != null && Array.isArray(categoryIds) && categoryIds.length > 0;

    if (hasCategoryIds) {
      const categories = await this.categoryRepo.find({ where: { id: In(categoryIds!) } });
      (createDto as any).categories = categories;
    }

    delete (createDto as any).category_ids;
    return true;
  }

  /**
   * Sau khi tạo: tạo ComicStats record
   */
  protected async afterCreate(entity: Comic, createDto: DeepPartial<Comic>): Promise<void> {
    // Tạo ComicStats record mặc định
    const stats = this.statsRepo.create({
      comic_id: entity.id,
      view_count: 0,
      follow_count: 0,
      rating_count: 0,
      rating_sum: 0,
    });
    await this.statsRepo.save(stats);
  }

  /**
   * Sau khi cập nhật: sync quan hệ nếu field ids được gửi lên
   */
  protected async afterUpdate(entity: Comic, updateDto: DeepPartial<Comic>): Promise<void> {
    const categoryIdsProvided = (updateDto as any).category_ids !== undefined;
    if (!categoryIdsProvided) return;

    const categoryIds = (updateDto as any).category_ids as number[] | null | undefined;
    if (categoryIds != null && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categories = await this.categoryRepo.find({ 
        where: { id: In(categoryIds) },
        select: ['id']
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
      }
      entity.categories = categories;
      await this.repository.save(entity);
    } else {
      // Nếu category_ids là mảng rỗng, xóa tất cả categories
      entity.categories = [];
      await this.repository.save(entity);
    }
  }

  /**
   * Override getOne để load relations và verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Comic | null> {
    const adminOptions = {
      ...options,
      relations: ['categories', 'stats'],
    };
    const comic = await super.getOne(where, adminOptions);
    // Comic không có group_id, skip ownership check
    return comic;
  }

  /**
   * Override beforeUpdate để verify ownership
   */
  protected override async beforeUpdate(
    entity: Comic,
    updateDto: DeepPartial<Comic>,
    response?: any
  ): Promise<boolean> {
    // Comic không có group_id, skip ownership check
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    if ('category_ids' in (updateDto as any)) {
      delete (updateDto as any).category_ids;
    }
    return true;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Comic,
    response?: any
  ): Promise<boolean> {
    // Comic không có group_id, skip ownership check
    return true;
  }

  /**
   * Assign categories to comic
   */
  async assignCategories(comicId: number, categoryIds: number[]) {
    const comic = await this.getOne({ id: comicId });
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    if (categoryIds.length > 0) {
      const categories = await this.categoryRepo.find({ 
        where: { id: In(categoryIds) },
        select: ['id']
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
      }
      comic.categories = categories;
    } else {
      comic.categories = [];
    }

    await this.repository.save(comic);
    return this.getOne({ id: comicId });
  }

  /**
   * Restore comic
   */
  async restore(id: number) {
    const comic = await this.repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    await this.repository.restore(id);
    await this.getOne({ id });
    return { restored: true };
  }
}

