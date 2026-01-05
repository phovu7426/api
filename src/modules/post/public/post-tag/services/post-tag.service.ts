import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostTagService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list of post tags
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PostTagWhereInput = {
      ...(filters?.status !== undefined ? { status: filters.status } : { status: 'active' }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search } },
          { slug: { contains: filters.search } },
        ],
      }),
      deleted_at: null,
    };

    const orderBy: Prisma.PostTagOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.postTag.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          created_at: true,
        },
      }),
      this.prisma.postTag.count({ where }),
    ]);

    return {
      data: data.map((tag: any) => ({
        ...tag,
        id: Number(tag.id),
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
   * Get one post tag
   */
  async getOne(where: any): Promise<any | null> {
    const whereInput: any = {
      ...(where.id && { id: BigInt(where.id) }),
      ...(where.slug && { slug: where.slug }),
      ...(where.status && { status: where.status }),
      deleted_at: null,
    };

    const tag = await this.prisma.postTag.findFirst({
      where: whereInput,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        created_at: true,
      },
    });

    if (!tag) {
      return null;
    }

    return {
      ...tag,
      id: Number(tag.id),
    };
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.PostTagOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PostTagOrderByWithRelationInput;
    });
  }
}
