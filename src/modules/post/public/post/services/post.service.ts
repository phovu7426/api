import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list of published posts
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PostWhereInput = {
      status: 'published',
      ...(filters?.primary_category_id && { primary_category_id: BigInt(filters.primary_category_id) }),
      ...(filters?.slug && { slug: filters.slug }),
      deleted_at: null,
    };

    const orderBy: Prisma.PostOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ published_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          excerpt: true,
          image: true,
          cover_image: true,
          published_at: true,
          view_count: true,
          created_at: true,
          primary_category: {
            where: {
              status: 'active',
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          categories: {
            where: {
              status: 'active',
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          tags: {
            where: {
              status: 'active',
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: data.map(post => ({
        ...post,
        id: Number(post.id),
        primary_category: post.primary_category ? {
          id: Number(post.primary_category.id),
          name: post.primary_category.name,
          slug: post.primary_category.slug,
          description: post.primary_category.description,
        } : null,
        categories: post.categories.map((cat: any) => ({
          id: Number(cat.id),
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        })),
        tags: post.tags.map((tag: any) => ({
          id: Number(tag.id),
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
        })),
      })),
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
  async getOne(where: any, options?: any) {
    const whereInput: Prisma.PostWhereInput = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.slug && { slug: where.slug }),
      status: 'published',
      deleted_at: null,
    };

    const post = await this.prisma.post.findFirst({
      where: whereInput,
      select: {
        id: true,
        name: true,
        slug: true,
        excerpt: true,
        content: true,
        image: true,
        cover_image: true,
        published_at: true,
        view_count: true,
        created_at: true,
        primary_category: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        categories: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        tags: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return {
      ...post,
      id: Number(post.id),
      primary_category: post.primary_category ? {
        id: Number(post.primary_category.id),
        name: post.primary_category.name,
        slug: post.primary_category.slug,
        description: post.primary_category.description,
      } : null,
      categories: post.categories.map((cat: any) => ({
        id: Number(cat.id),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      })),
      tags: post.tags.map((tag: any) => ({
        id: Number(tag.id),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
      })),
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(postId: number): Promise<void> {
    try {
      await this.prisma.post.update({
        where: { id: BigInt(postId) },
        data: {
          view_count: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      // Ignore errors khi tăng view count
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
