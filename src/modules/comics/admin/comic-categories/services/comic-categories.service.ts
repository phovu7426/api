import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class ComicCategoriesService extends CrudService<ComicCategory> {
  constructor(
    @InjectRepository(ComicCategory) protected readonly repo: Repository<ComicCategory>,
  ) {
    super(repo);
  }

  /**
   * Hook trước khi tạo - xử lý slug
   */
  protected async beforeCreate(entity: ComicCategory, createDto: DeepPartial<ComicCategory>): Promise<boolean> {
    await this.ensureSlug(createDto);
    return true;
  }

  /**
   * Hook trước khi cập nhật - xử lý slug
   */
  protected override async beforeUpdate(
    entity: ComicCategory,
    updateDto: DeepPartial<ComicCategory>,
    response?: any
  ): Promise<boolean> {
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    return true;
  }
}



