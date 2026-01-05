import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '@/shared/entities/post.entity';
import { ListService } from '@/common/base/services/list.service';

@Injectable()
export class PostService extends ListService<Post> {
  constructor(
    @InjectRepository(Post) protected readonly repo: Repository<Post>,
  ) {
    super(repo);
  }

  protected prepareFilters(filters: any = {}) {
    return {
      ...filters,
      status: 'published',
    };
  }

  protected prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      select: ['id', 'name', 'slug', 'excerpt', 'image', 'cover_image', 'published_at', 'view_count', 'created_at'],
      relations: [
        { name: 'primary_category', select: ['id', 'name', 'slug', 'description'], where: { status: 'active' } },
        { name: 'categories', select: ['id', 'name', 'slug', 'description'], where: { status: 'active' } },
        { name: 'tags', select: ['id', 'name', 'slug', 'description'], where: { status: 'active' } }
      ],
    } as any;
  }

  /**
   * Tăng view count cho post (không chặn nếu lỗi)
   */
  async incrementViewCount(postId: number): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .update('posts')
        .set({ view_count: () => 'view_count + 1' })
        .where('id = :id', { id: postId })
        .execute();
    } catch (error) {
      // Ignore errors khi tăng view count
    }
  }

}
