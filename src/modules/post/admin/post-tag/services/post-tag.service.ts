import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class PostTagService extends CrudService<PostTag> {
  constructor(
    @InjectRepository(PostTag) protected readonly repo: Repository<PostTag>,
  ) {
    super(repo);
  }

  /**
   * Hook trước khi tạo - xử lý slug
   */
  protected async beforeCreate(entity: PostTag, createDto: DeepPartial<PostTag>): Promise<boolean> {
    await this.ensureSlug(createDto);
    return true;
  }

  /**
   * Hook trước khi cập nhật - xử lý slug
   */
  protected async beforeUpdate(entity: PostTag, updateDto: DeepPartial<PostTag>): Promise<boolean> {
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    return true;
  }

}

