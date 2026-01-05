import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class PostCategoryService {
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
   * Get list of post categories
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PostCategoryWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.parent_id !== undefined && { parent_id: filters.parent_id ? BigInt(filters.parent_id) : null }),
      deleted_at: null,
    };

    const orderBy: Prisma.PostCategoryOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.postCategory.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
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
      data,
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
  async getOne(where: Prisma.PostCategoryWhereUniqueInput | Prisma.PostCategoryWhereInput) {
    if ('id' in where) {
      return this.prisma.postCategory.findUnique({
        where: { id: BigInt(where.id as any), deleted_at: null },
        include: {
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
    }
    return this.prisma.postCategory.findFirst({
      where: { ...where, deleted_at: null },
      include: {
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
  }

  /**
   * Create post category
   */
  async create(data: Prisma.PostCategoryCreateInput, createdBy?: number) {
    await this.ensureSlug(data);

    return this.prisma.postCategory.create({
      data: {
        ...data,
        created_user_id: createdBy ?? null,
        updated_user_id: createdBy ?? null,
      },
      include: {
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
  }

  /**
   * Update post category
   */
  async update(id: number, data: Prisma.PostCategoryUpdateInput, updatedBy?: number) {
    const existing = await this.prisma.postCategory.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Post category with ID ${id} not found`);
    }

    await this.ensureSlug(data, id, existing.slug);

    return this.prisma.postCategory.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        updated_user_id: updatedBy ?? existing.updated_user_id,
      },
      include: {
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
  }

  /**
   * Delete post category (soft delete)
   */
  async delete(id: number) {
    return this.prisma.postCategory.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
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
      const existing = await this.prisma.postCategory.findFirst({
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
          const check = await this.prisma.postCategory.findFirst({
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
  private parseSort(sort: string | string[]): Prisma.PostCategoryOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PostCategoryOrderByWithRelationInput;
    });
  }
}
