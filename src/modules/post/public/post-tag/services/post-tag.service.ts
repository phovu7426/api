import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { ListService } from '@/common/base/services/list.service';

@Injectable()
export class PostTagService extends ListService<PostTag> {
  constructor(
    @InjectRepository(PostTag) protected readonly repo: Repository<PostTag>,
  ) {
    super(repo);
  }

  protected prepareFilters(filters: any = {}) {
    const prepared: any = { ...filters };
    if (prepared.status === undefined) prepared.status = 'active';
    if (prepared.search) {
      // Controller có thể map search -> name chứa; ở đây giữ nguyên để helper xử lý where cơ bản
    }
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

