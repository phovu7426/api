import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Injectable()
export class PostCategoryService extends CrudService<PostCategory> {
  constructor(
    @InjectRepository(PostCategory) protected readonly repo: Repository<PostCategory>,
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
      relations: [
        { name: 'parent', select: ['id', 'name', 'slug'] },
        { name: 'children', select: ['id', 'name', 'slug'] },
      ],
    } as any;
  }

  /**
   * Override getOne để load relations
   */
  async getOne(
    where: any,
    options?: any,
  ) {
    // Đảm bảo load relations trong admin
    const adminOptions = {
      ...options,
      relations: [
        { name: 'parent', select: ['id', 'name', 'slug'] },
        { name: 'children', select: ['id', 'name', 'slug'] },
      ],
    };
    return super.getOne(where, adminOptions);
  }

  /**
   * Hook trước khi tạo - xử lý slug
   */
  protected async beforeCreate(entity: PostCategory, createDto: DeepPartial<PostCategory>): Promise<boolean> {
    await this.ensureSlug(createDto);
    return true;
  }

  /**
   * Hook trước khi cập nhật - xử lý slug
   */
  protected async beforeUpdate(entity: PostCategory, updateDto: DeepPartial<PostCategory>): Promise<boolean> {
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    return true;
  }

}

