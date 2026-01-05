import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { ListService } from '@/common/base/services/list.service';

@Injectable()
export class PublicComicCategoriesService extends ListService<ComicCategory> {
  constructor(
    @InjectRepository(ComicCategory) protected readonly repo: Repository<ComicCategory>,
  ) {
    super(repo);
  }

  protected prepareFilters(filters: any = {}) {
    const prepared: any = { ...filters };
    // ComicCategory không có status field, chỉ filter theo deleted_at (soft delete)
    // TypeORM tự động filter deleted_at = null khi dùng find()
    return prepared;
  }

  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      select: ['id', 'name', 'slug', 'description', 'created_at'],
      sort: base.sort ?? 'created_at:DESC',
    } as any;
  }
}

