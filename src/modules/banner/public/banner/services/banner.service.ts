import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublicBannerService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Get list of active banners with date range filter
     */
    async getList(filters?: any, options?: any) {
        const now = new Date();
        const where: Prisma.BannerWhereInput = {
            status: BasicStatus.active,
            ...(filters?.location_id && { location_id: BigInt(filters.location_id) }),
            // Date range filter: start_date <= now (or null), end_date >= now (or null)
            AND: [
                {
                    OR: [
                        { start_date: null },
                        { start_date: { lte: now } },
                    ],
                },
                {
                    OR: [
                        { end_date: null },
                        { end_date: { gte: now } },
                    ],
                },
            ],
            deleted_at: null,
        };

        const orderBy: Prisma.BannerOrderByWithRelationInput[] = options?.sort 
            ? this.parseSort(options.sort)
            : [{ sort_order: 'asc' }, { created_at: 'desc' }];

        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.banner.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    location: true,
                },
            }),
            this.prisma.banner.count({ where }),
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
     * Get one banner
     */
    async getOne(where: Prisma.BannerWhereInput, options?: any) {
        const now = new Date();
        return this.prisma.banner.findFirst({
            where: {
                ...where,
                status: BasicStatus.active,
                deleted_at: null,
                // Date range filter
                AND: [
                    {
                        OR: [
                            { start_date: null },
                            { start_date: { lte: now } },
                        ],
                    },
                    {
                        OR: [
                            { end_date: null },
                            { end_date: { gte: now } },
                        ],
                    },
                ],
            },
            include: {
                location: true,
            },
        });
    }

    /**
     * Find by location code
     */
    async findByLocationCode(locationCode: string): Promise<any[]> {
        const location = await this.prisma.bannerLocation.findUnique({
            where: { code: locationCode },
        });

        if (!location || location.status !== BasicStatus.active) {
            throw new NotFoundException(`Vị trí banner với mã "${locationCode}" không tồn tại hoặc không hoạt động`);
        }

        const result = await this.getList(
            { location_id: Number(location.id) },
            { limit: 1000, page: 1 }
        );

        return result.data;
    }

    /**
     * Find active banners by location code(s)
     */
    async findActiveBanners(locationCode?: string): Promise<{ [locationCode: string]: any[] }> {
        const where: Prisma.BannerLocationWhereInput = {
            status: BasicStatus.active,
            ...(locationCode && { code: locationCode }),
        };

        const locations = await this.prisma.bannerLocation.findMany({ where });
        const result: { [locationCode: string]: any[] } = {};

        for (const location of locations) {
            const bannerResult = await this.getList(
                { location_id: Number(location.id) },
                { limit: 1000, page: 1 }
            );

            if (bannerResult.data.length > 0) {
                result[location.code] = bannerResult.data;
            }
        }

        return result;
    }

    /**
     * Find banner by ID
     */
    async findBannerById(id: number): Promise<any> {
        const banner = await this.getOne({ id: BigInt(id) });

        if (!banner) {
            throw new NotFoundException(`Banner với ID ${id} không tồn tại hoặc không hoạt động`);
        }

        return banner;
    }

    /**
     * Parse sort string to Prisma orderBy
     */
    private parseSort(sort: string | string[]): Prisma.BannerOrderByWithRelationInput[] {
        const sorts = Array.isArray(sort) ? sort : [sort];
        return sorts.map(s => {
            const [field, direction] = s.split(':');
            return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.BannerOrderByWithRelationInput;
        });
    }
}
