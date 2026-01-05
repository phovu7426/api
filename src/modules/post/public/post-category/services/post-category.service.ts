import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostCategoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list of post categories
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PostCategoryWhereInput = {
      ...(filters?.status !== undefined ? { status: filters.status } : { status: 'active' }),
      deleted_at: null,
    };

    const orderBy: Prisma.PostCategoryOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ sort_order: 'asc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.postCategory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          sort_order: true,
          created_at: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.postCategory.count({ where }),
    ]);

    return {
      data: data.map(cat => ({
        ...cat,
        id: Number(cat.id),
        parent_id: cat.parent ? Number(cat.parent.id) : null,
        parent: cat.parent ? {
          ...cat.parent,
          id: Number(cat.parent.id),
        } : null,
        children: cat.children?.map(child => ({
          ...child,
          id: Number(child.id),
        })) || [],
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
   * Get one post category
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: any = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.slug && { slug: where.slug }),
      ...(where.status && { status: where.status }),
      deleted_at: null,
    };

    const category = await this.prisma.postCategory.findFirst({
      where: whereInput,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        sort_order: true,
        created_at: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    return {
      ...category,
      id: Number(category.id),
      parent_id: category.parent ? Number(category.parent.id) : null,
      parent: category.parent ? {
        ...category.parent,
        id: Number(category.parent.id),
      } : null,
      children: category.children?.map(child => ({
        ...child,
        id: Number(child.id),
      })) || [],
    };
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.PostCategoryOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PostCategoryOrderByWithRelationInput;
    });
  }
}
