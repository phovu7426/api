import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get simple list (without relations)
   */
  async getSimpleList(filters?: any, options?: any) {
    return this.getList(filters, options);
  }

  /**
   * Get list of posts
   */
  async getList(filters?: any, options?: any) {
    // Apply group filter
    const preparedFilters = this.prepareFilters(filters);

    const where: Prisma.PostWhereInput = {
      ...(preparedFilters?.status && { status: preparedFilters.status }),
      ...(preparedFilters?.group_id !== undefined && { group_id: preparedFilters.group_id ? BigInt(preparedFilters.group_id) : null }),
      ...(preparedFilters?.primary_category_id && { primary_category_id: BigInt(preparedFilters.primary_category_id) }),
      deleted_at: null,
    };

    const orderBy: Prisma.PostOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          primary_category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Transform data
    const transformedData = this.transformPostList(data);

    return {
      data: transformedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one post
   */
  async getOne(where: any, options?: any): Promise<any | null> {
    const whereInput: Prisma.PostWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.slug && { slug: where.slug }),
      deleted_at: null,
    };

    const post = await this.prisma.post.findFirst({
      where: whereInput,
      include: {
        primary_category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (post) {
      verifyGroupOwnership({ group_id: post.group_id ? Number(post.group_id) : null });
      return this.transformPost(post);
    }

    return null;
  }

  /**
   * Create post
   */
  async create(data: any, createdBy?: number) {
    // Ensure slug
    await this.ensureSlug(data);

    // Prepare data
    const tagIds = data.tag_ids as number[] | undefined;
    const categoryIds = data.category_ids as number[] | undefined;
    const primaryCategoryId = data.primary_category_id ? BigInt(data.primary_category_id) : null;
    const groupId = data.group_id ? BigInt(data.group_id) : null;

    // Validate tags and categories
    if (tagIds && tagIds.length > 0) {
      const tags = await this.prisma.postTag.findMany({
        where: { id: { in: tagIds.map(id => BigInt(id)) } },
      });
      if (tags.length !== tagIds.length) {
        throw new BadRequestException('Một hoặc nhiều tag ID không hợp lệ');
      }
    }

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.prisma.postCategory.findMany({
        where: { id: { in: categoryIds.map(id => BigInt(id)) } },
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
      }
    }

    // Create post with relations
    const post = await this.prisma.post.create({
      data: {
        name: data.name,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,
        image: data.image ?? null,
        cover_image: data.cover_image ?? null,
        status: data.status ?? 'draft',
        published_at: data.published_at ? new Date(data.published_at) : null,
        ...(primaryCategoryId && { primary_category: { connect: { id: primaryCategoryId } } }),
        group_id: groupId,
        created_user_id: createdBy ?? null,
        updated_user_id: createdBy ?? null,
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(id => ({ id: BigInt(id) })),
        } : undefined,
        categories: categoryIds && categoryIds.length > 0 ? {
          connect: categoryIds.map(id => ({ id: BigInt(id) })),
        } : undefined,
      },
      include: {
        primary_category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return this.transformPost(post);
  }

  /**
   * Update post
   */
  async update(id: number, data: any, updatedBy?: number) {
    const existing = await this.prisma.post.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Post with ID ${id} not found`);
    }

    verifyGroupOwnership({ group_id: existing.group_id ? Number(existing.group_id) : null });

    // Ensure slug
    await this.ensureSlug(data, id, existing.slug);

    // Prepare update data
    const updateData: Prisma.PostUncheckedUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.cover_image !== undefined && { cover_image: data.cover_image }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.published_at !== undefined && { published_at: data.published_at ? new Date(data.published_at) : null }),
      ...(data.primary_category_id !== undefined && { primary_category_id: data.primary_category_id ? BigInt(data.primary_category_id) : null }),
      ...(data.group_id !== undefined && { group_id: data.group_id ? BigInt(data.group_id) : null }),
      updated_user_id: updatedBy ?? existing.updated_user_id,
    };

    // Handle tags
    if (data.tag_ids !== undefined) {
      const tagIds = data.tag_ids as number[] | null | undefined;
      if (tagIds && tagIds.length > 0) {
        const tags = await this.prisma.postTag.findMany({
          where: { id: { in: tagIds.map(id => BigInt(id)) } },
        });
        if (tags.length !== tagIds.length) {
          throw new BadRequestException('Một hoặc nhiều tag ID không hợp lệ');
        }
        await this.prisma.post.update({
          where: { id: BigInt(id) },
          data: {
            tags: {
              set: tagIds.map(id => ({ id: BigInt(id) })),
            },
          },
        });
      } else {
        await this.prisma.post.update({
          where: { id: BigInt(id) },
          data: {
            tags: {
              set: [],
            },
          },
        });
      }
    }

    // Handle categories
    if (data.category_ids !== undefined) {
      const categoryIds = data.category_ids as number[] | null | undefined;
      if (categoryIds && categoryIds.length > 0) {
        const categories = await this.prisma.postCategory.findMany({
          where: { id: { in: categoryIds.map(id => BigInt(id)) } },
        });
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
        }
        await this.prisma.post.update({
          where: { id: BigInt(id) },
          data: {
            categories: {
              set: categoryIds.map(id => ({ id: BigInt(id) })),
            },
          },
        });
      } else {
        await this.prisma.post.update({
          where: { id: BigInt(id) },
          data: {
            categories: {
              set: [],
            },
          },
        });
      }
    }

    // Update other fields
    const post = await this.prisma.post.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        primary_category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return this.transformPost(post);
  }

  /**
   * Delete post (soft delete)
   */
  async delete(id: number) {
    const existing = await this.prisma.post.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Post with ID ${id} not found`);
    }

    verifyGroupOwnership({ group_id: existing.group_id ? Number(existing.group_id) : null });

    return this.prisma.post.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Prepare filters with group context
   */
  private prepareFilters(filters?: any): any {
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
   * Transform post list
   */
  private transformPostList(posts: any[]): any[] {
    return posts.map(post => this.transformPost(post));
  }

  /**
   * Transform single post
   */
  private transformPost(post: any): any {
    return {
      ...post,
      id: Number(post.id),
      group_id: post.group_id ? Number(post.group_id) : null,
      primary_category_id: post.primary_category_id ? Number(post.primary_category_id) : null,
      primary_category: post.primary_category ? {
        id: Number(post.primary_category.id),
        name: post.primary_category.name,
        slug: post.primary_category.slug,
      } : null,
      categories: post.categories?.map((cat: any) => ({
        id: Number(cat.id),
        name: cat.name,
        slug: cat.slug,
      })) || [],
      tags: post.tags?.map((tag: any) => ({
        id: Number(tag.id),
        name: tag.name,
        slug: tag.slug,
      })) || [],
    };
  }

  /**
   * Ensure slug is unique
   */
  private async ensureSlug(data: any, excludeId?: number, currentSlug?: string): Promise<void> {
    // If no slug → create from name
    if (data.name && !data.slug) {
      data.slug = StringUtil.toSlug(data.name);
    }
    
    // If has slug → check uniqueness
    if (data.slug) {
      const normalizedSlug = StringUtil.toSlug(data.slug);
      
      // If updating and slug unchanged, skip check
      if (excludeId && currentSlug && normalizedSlug === StringUtil.toSlug(currentSlug)) {
        delete data.slug;
        return;
      }

      // Check if slug exists
      const existing = await this.prisma.post.findFirst({
        where: {
          slug: normalizedSlug,
          ...(excludeId && { id: { not: BigInt(excludeId) } }),
          deleted_at: null,
        },
      });

      if (existing) {
        // Generate unique slug
        let counter = 1;
        let uniqueSlug = normalizedSlug;
        while (true) {
          const check = await this.prisma.post.findFirst({
            where: {
              slug: uniqueSlug,
              ...(excludeId && { id: { not: BigInt(excludeId) } }),
              deleted_at: null,
            },
          });
          if (!check) break;
          uniqueSlug = `${normalizedSlug}-${counter}`;
          counter++;
        }
        data.slug = uniqueSlug;
      } else {
        data.slug = normalizedSlug;
      }
    }
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.PostOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PostOrderByWithRelationInput;
    });
  }
}
