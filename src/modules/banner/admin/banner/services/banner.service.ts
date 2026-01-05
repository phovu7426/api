import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannerService {
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
     * Get list of banners
     */
    async getList(filters?: any, options?: any) {
        const now = new Date();
        const where: Prisma.BannerWhereInput = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.location_id && { location_id: BigInt(filters.location_id) }),
            // If filtering by Active status, add date range filter
            ...(filters?.status === BasicStatus.active && {
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
            }),
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
    async getOne(where: Prisma.BannerWhereUniqueInput | Prisma.BannerWhereInput) {
        if ('id' in where) {
            return this.prisma.banner.findUnique({
                where: { id: BigInt(where.id as any), deleted_at: null },
                include: {
                    location: true,
                },
            });
        }
        return this.prisma.banner.findFirst({
            where: { ...where, deleted_at: null },
            include: {
                location: true,
            },
        });
    }

    /**
     * Create banner
     */
    async create(data: any, createdBy?: number) {
        // Validate location_id
        const locationId = data.location_id ? BigInt(data.location_id) : null;
        if (locationId) {
            const location = await this.prisma.bannerLocation.findUnique({
                where: { id: locationId },
            });
            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${data.location_id} không tồn tại`);
            }
        }

        // Convert link_target enum
        const linkTarget = data.link_target === '_self' || data.link_target === 'self' ? 'self' : 
                          data.link_target === '_blank' || data.link_target === 'blank' ? 'blank' : 
                          'self';

        return this.prisma.banner.create({
            data: {
                title: data.title,
                subtitle: data.subtitle ?? null,
                image: data.image,
                mobile_image: data.mobile_image ?? null,
                link: data.link ?? null,
                link_target: linkTarget,
                description: data.description ?? null,
                button_text: data.button_text ?? null,
                button_color: data.button_color ?? null,
                text_color: data.text_color ?? null,
                location_id: locationId!,
                sort_order: data.sort_order ?? 0,
                status: data.status ?? 'active',
                start_date: data.start_date ? new Date(data.start_date) : null,
                end_date: data.end_date ? new Date(data.end_date) : null,
                created_user_id: createdBy ?? null,
                updated_user_id: createdBy ?? null,
            },
            include: {
                location: true,
            },
        });
    }

    /**
     * Update banner
     */
    async update(id: number, data: any, updatedBy?: number) {
        const existing = await this.prisma.banner.findUnique({ where: { id: BigInt(id) } });
        if (!existing) {
            throw new NotFoundException(`Banner with ID ${id} not found`);
        }

        // Validate location_id if changed
        const locationId = data.location_id !== undefined ? (data.location_id ? BigInt(data.location_id) : null) : undefined;
        if (locationId !== undefined && locationId !== existing.location_id) {
            if (locationId) {
                const location = await this.prisma.bannerLocation.findUnique({
                    where: { id: locationId },
                });
                if (!location) {
                    throw new NotFoundException(`Vị trí banner với ID ${data.location_id} không tồn tại`);
                }
            }
        }

        // Convert link_target enum
        let linkTarget: 'self' | 'blank' | undefined = undefined;
        if (data.link_target !== undefined) {
            linkTarget = data.link_target === '_self' || data.link_target === 'self' ? 'self' : 
                        data.link_target === '_blank' || data.link_target === 'blank' ? 'blank' : 
                        'self';
        }

        const updateData: Prisma.BannerUncheckedUpdateInput = {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
            ...(data.image !== undefined && { image: data.image }),
            ...(data.mobile_image !== undefined && { mobile_image: data.mobile_image }),
            ...(data.link !== undefined && { link: data.link }),
            ...(linkTarget !== undefined && { link_target: linkTarget }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.button_text !== undefined && { button_text: data.button_text }),
            ...(data.button_color !== undefined && { button_color: data.button_color }),
            ...(data.text_color !== undefined && { text_color: data.text_color }),
            ...(locationId !== undefined && locationId !== null && { location_id: locationId }),
            ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.start_date !== undefined && { start_date: data.start_date ? new Date(data.start_date) : null }),
            ...(data.end_date !== undefined && { end_date: data.end_date ? new Date(data.end_date) : null }),
            updated_user_id: updatedBy ?? existing.updated_user_id,
        };

        return this.prisma.banner.update({
            where: { id: BigInt(id) },
            data: updateData,
            include: {
                location: true,
            },
        });
    }

    /**
     * Delete banner (soft delete)
     */
    async delete(id: number) {
        return this.prisma.banner.update({
            where: { id: BigInt(id) },
            data: { deleted_at: new Date() },
        });
    }

    /**
     * Change status
     */
    async changeStatus(id: number, status: BasicStatus) {
        return this.update(id, { status });
    }

    /**
     * Update sort order
     */
    async updateSortOrder(id: number, sortOrder: number) {
        return this.update(id, { sort_order: sortOrder });
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
            { location_id: Number(location.id), status: BasicStatus.active },
            { limit: 1000, page: 1 }
        );

        return result.data;
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
