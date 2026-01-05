import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StringUtil } from '@/core/utils/string.util';

@Injectable()
export class PostTagService {
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
   * Get list of post tags
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.PostTagWhereInput = {
      ...(filters?.status && { status: filters.status }),
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
      }),
      this.prisma.postTag.count({ where }),
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
   * Get one post tag
   */
  async getOne(where: Prisma.PostTagWhereUniqueInput | Prisma.PostTagWhereInput) {
    if ('id' in where) {
      return this.prisma.postTag.findUnique({
        where: { id: BigInt(where.id as any), deleted_at: null },
      });
    }
    return this.prisma.postTag.findFirst({
      where: { ...where, deleted_at: null },
    });
  }

  /**
   * Create post tag
   */
  async create(data: Prisma.PostTagCreateInput, createdBy?: number) {
    await this.ensureSlug(data);

    return this.prisma.postTag.create({
      data: {
        ...data,
        created_user_id: createdBy ?? null,
        updated_user_id: createdBy ?? null,
      },
    });
  }

  /**
   * Update post tag
   */
  async update(id: number, data: Prisma.PostTagUpdateInput, updatedBy?: number) {
    const existing = await this.prisma.postTag.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new Error(`Post tag with ID ${id} not found`);
    }

    await this.ensureSlug(data, id, existing.slug);

    return this.prisma.postTag.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        updated_user_id: updatedBy ?? existing.updated_user_id,
      },
    });
  }

  /**
   * Delete post tag (soft delete)
   */
  async delete(id: number) {
    return this.prisma.postTag.update({
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
      const existing = await this.prisma.postTag.findFirst({
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
          const check = await this.prisma.postTag.findFirst({
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
  private parseSort(sort: string | string[]): Prisma.PostTagOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.PostTagOrderByWithRelationInput;
    });
  }
}
