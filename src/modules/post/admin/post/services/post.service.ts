import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { Post } from '@/shared/entities/post.entity';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';

@Injectable()
export class PostService extends CrudService<Post> {
  private get categoryRepo(): Repository<PostCategory> {
    return this.repository.manager.getRepository(PostCategory);
  }

  private get tagRepo(): Repository<PostTag> {
    return this.repository.manager.getRepository(PostTag);
  }

  constructor(
    @InjectRepository(Post) protected readonly repo: Repository<Post>,
  ) {
    super(repo);
  }

  /**
   * Áp dụng filter theo group/context mặc định nếu có contextId
   */
  protected override prepareFilters(
    filters?: any,
    _options?: any,
  ): boolean | any {
    const prepared = { ...(filters || {}) };

    // Nếu đã truyền group_id trong filters thì không override
    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');

      // Nếu context không phải system (contextId !== 1) và có ref_id, dùng ref_id làm group_id
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = groupId;
      }
    }

    return prepared;
  }

  /**
   * Override để load relations trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['primary_category', 'categories', 'tags'],
    } as any;
  }


  /**
   * Transform data sau khi lấy danh sách để chỉ giữ các fields cần thiết
   */
  protected async afterGetList(
    data: Post[],
    filters?: any,
    options?: any
  ): Promise<Post[]> {
    // Transform để chỉ giữ các fields cần thiết từ relations
    return data.map(post => {
      if (post.primary_category) {
        const { id, name, slug } = post.primary_category;
        post.primary_category = { id, name, slug } as any;
      }
      if (post.categories) {
        post.categories = post.categories.map(cat => {
          const { id, name, slug } = cat;
          return { id, name, slug } as any;
        });
      }
      if (post.tags) {
        post.tags = post.tags.map(tag => {
          const { id, name, slug } = tag;
          return { id, name, slug } as any;
        });
      }
      return post;
    });
  }

  /**
   * Transform data sau khi lấy một entity
   */
  protected async afterGetOne(
    entity: Post,
    where?: any,
    options?: any
  ): Promise<Post> {
    // Transform để chỉ giữ các fields cần thiết từ relations
    if (entity.primary_category) {
      const { id, name, slug } = entity.primary_category;
      entity.primary_category = { id, name, slug } as any;
    }
    if (entity.categories) {
      entity.categories = entity.categories.map(cat => {
        const { id, name, slug } = cat;
        return { id, name, slug } as any;
      });
    }
    if (entity.tags) {
      entity.tags = entity.tags.map(tag => {
        const { id, name, slug } = tag;
        return { id, name, slug } as any;
      });
    }
    return entity;
  }

  /**
   * Hook trước khi tạo - xử lý slug và quan hệ
   */
  protected async beforeCreate(entity: Post, createDto: DeepPartial<Post>): Promise<boolean> {
    await this.ensureSlug(createDto);

    // Tối ưu: Load tags và categories trước khi save để chỉ save một lần
    const tagIds = (createDto as any).tag_ids as number[] | undefined;
    const categoryIds = (createDto as any).category_ids as number[] | undefined;
    const hasTagIds = tagIds != null && Array.isArray(tagIds) && tagIds.length > 0;
    const hasCategoryIds = categoryIds != null && Array.isArray(categoryIds) && categoryIds.length > 0;

    if (hasTagIds || hasCategoryIds) {
      const [tags, categories] = await Promise.all([
        hasTagIds ? this.tagRepo.find({ where: { id: In(tagIds!) } }) : Promise.resolve([]),
        hasCategoryIds ? this.categoryRepo.find({ where: { id: In(categoryIds!) } }) : Promise.resolve([]),
      ]);

      // Gán quan hệ vào createDto để entity được tạo với relations đầy đủ
      (createDto as any).tags = tags;
      (createDto as any).categories = categories;
    }

    // Dọn dẹp trường quan hệ dạng IDs khỏi DTO trước khi persist
    delete (createDto as any).tag_ids;
    delete (createDto as any).category_ids;
    return true;
  }


  /**
   * Sau khi tạo: không cần làm gì vì relations đã được set trong beforeCreate
   */
  protected async afterCreate(entity: Post, createDto: DeepPartial<Post>): Promise<void> {
    // Relations đã được set trong beforeCreate, không cần save lại
  }

  /**
   * Sau khi cập nhật: sync quan hệ nếu field ids được gửi lên
   */
  protected async afterUpdate(entity: Post, updateDto: DeepPartial<Post>): Promise<void> {
    const tagIdsProvided = (updateDto as any).tag_ids !== undefined;
    const categoryIdsProvided = (updateDto as any).category_ids !== undefined;
    if (!tagIdsProvided && !categoryIdsProvided) return;

    const promises: Promise<any>[] = [];
    let tags: PostTag[] = [];
    let categories: PostCategory[] = [];

    if (tagIdsProvided) {
      const tagIds = (updateDto as any).tag_ids as number[] | null | undefined;
      if (tagIds != null && Array.isArray(tagIds) && tagIds.length > 0) {
        promises.push(
          this.tagRepo.find({ 
            where: { id: In(tagIds) },
            select: ['id']
          }).then(res => {
            if (res.length !== tagIds.length) {
              throw new BadRequestException('Một hoặc nhiều tag ID không hợp lệ');
            }
            tags = res;
          })
        );
      }
    }

    if (categoryIdsProvided) {
      const categoryIds = (updateDto as any).category_ids as number[] | null | undefined;
      if (categoryIds != null && Array.isArray(categoryIds) && categoryIds.length > 0) {
        promises.push(
          this.categoryRepo.find({ 
            where: { id: In(categoryIds) },
            select: ['id']
          }).then(res => {
            if (res.length !== categoryIds.length) {
              throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
            }
            categories = res;
          })
        );
      }
    }

    if (promises.length > 0) await Promise.all(promises);

    if (tagIdsProvided) entity.tags = tags;
    if (categoryIdsProvided) entity.categories = categories;
    await this.repository.save(entity);
  }

  /**
   * Override getOne để load relations và verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Post | null> {
    // Đảm bảo load relations trong admin
    const adminOptions = {
      ...options,
      relations: ['primary_category', 'categories', 'tags'],
    };
    const post = await super.getOne(where, adminOptions);
    if (post) {
      verifyGroupOwnership(post);
    }
    return post;
  }

  /**
   * Override beforeUpdate để verify ownership
   */
  protected override async beforeUpdate(
    entity: Post,
    updateDto: DeepPartial<Post>,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    await this.ensureSlug(updateDto, entity.id, entity.slug);
    if ('tag_ids' in (updateDto as any)) {
      delete (updateDto as any).tag_ids;
    }
    if ('category_ids' in (updateDto as any)) {
      delete (updateDto as any).category_ids;
    }
    return true;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Post,
    response?: any
  ): Promise<boolean> {
    verifyGroupOwnership(entity);
    return true;
  }

}


