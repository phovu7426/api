import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannerLocationService {
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
   * Get list of banner locations
   */
  async getList(filters?: any, options?: any) {
        const where: Prisma.BannerLocationWhereInput = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.code && { code: { contains: filters.code } }),
            deleted_at: null,
        };

        const orderBy: Prisma.BannerLocationOrderByWithRelationInput[] = options?.sort 
            ? this.parseSort(options.sort)
            : [{ created_at: 'desc' }];

        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.bannerLocation.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.bannerLocation.count({ where }),
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
     * Get one banner location
     */
    async getOne(where: Prisma.BannerLocationWhereUniqueInput) {
        return this.prisma.bannerLocation.findUnique({
            where: { ...where, deleted_at: null },
        });
    }

    /**
     * Create banner location
     */
    async create(data: Prisma.BannerLocationCreateInput, createdBy?: number) {
        // Check code unique
        if (data.code) {
            const existing = await this.prisma.bannerLocation.findUnique({
                where: { code: data.code as string },
            });
            if (existing) {
                throw new ConflictException(`Mã vị trí banner "${data.code}" đã tồn tại`);
            }
        }

        return this.prisma.bannerLocation.create({
            data: {
                ...data,
                created_user_id: createdBy ?? null,
                updated_user_id: createdBy ?? null,
            },
        });
    }

    /**
     * Update banner location
     */
    async update(id: number | bigint, data: Prisma.BannerLocationUpdateInput, updatedBy?: number) {
        const idBigInt = typeof id === 'number' ? BigInt(id) : id;
        const existing = await this.prisma.bannerLocation.findUnique({ where: { id: idBigInt } });
        if (!existing) {
            throw new Error(`Banner location with ID ${id} not found`);
        }

        // Check code unique if changed
        if (data.code && data.code !== existing.code) {
            const codeExists = await this.prisma.bannerLocation.findUnique({
                where: { code: data.code as string },
            });
            if (codeExists) {
                throw new ConflictException(`Mã vị trí banner "${data.code}" đã tồn tại`);
            }
        }

        return this.prisma.bannerLocation.update({
            where: { id: idBigInt },
            data: {
                ...data,
                updated_user_id: updatedBy ?? existing.updated_user_id,
            },
        });
    }

  /**
   * Delete banner location
   */
  async delete(id: number | bigint) {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    return this.prisma.bannerLocation.update({
      where: { id: idBigInt },
            data: { deleted_at: new Date() },
        });
    }

  /**
   * Change status
   */
  async changeStatus(id: number | bigint, status: BasicStatus) {
    return this.update(id, { status });
  }

    /**
     * Parse sort string to Prisma orderBy
     */
    private parseSort(sort: string | string[]): Prisma.BannerLocationOrderByWithRelationInput[] {
        const sorts = Array.isArray(sort) ? sort : [sort];
        return sorts.map(s => {
            const [field, direction] = s.split(':');
            return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.BannerLocationOrderByWithRelationInput;
        });
    }
}
