import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { ListService } from '@/common/base/services/list.service';
import { Filters, Options } from '@/common/base/interfaces/list.interface';

@Injectable()
export class PublicBannerService extends ListService<Banner> {
    constructor(
        @InjectRepository(Banner)
        protected readonly bannerRepository: Repository<Banner>,
        @InjectRepository(BannerLocation)
        private readonly bannerLocationRepository: Repository<BannerLocation>,
    ) {
        super(bannerRepository);
    }

    /**
     * Override prepareFilters để thêm filter active banners + date range
     * Lọc: status = active, start_date <= now, end_date >= now (hoặc null)
     */
    protected prepareFilters(filters?: Filters<Banner>, options?: Options): any {
        const now = new Date();
        return {
            ...filters,
            status: BasicStatus.Active,
            start_date: Or(IsNull(), LessThanOrEqual(now)),
            end_date: Or(IsNull(), MoreThanOrEqual(now)),
        };
    }

    /**
     * Override prepareOptions để set default sort
     */
    protected prepareOptions(queryOptions: any = {}): any {
        const options = super.prepareOptions(queryOptions);
        
        if (!options.sort) {
            options.sort = ['sort_order:ASC', 'created_at:DESC'];
        }

        return options;
    }

    async findByLocationCode(locationCode: string): Promise<Banner[]> {
        const location = await this.bannerLocationRepository.findOne({
            where: {
                code: locationCode,
                status: BasicStatus.Active
            },
        });

        if (!location) {
            throw new NotFoundException(`Vị trí banner với mã "${locationCode}" không tồn tại hoặc không hoạt động`);
        }

        // Tận dụng getList với filters
        const result = await this.getList(
            { location_id: location.id } as any,
            { limit: 1000, page: 1 }
        );

        return result.data;
    }

    async findActiveBanners(locationCode?: string): Promise<{
        [locationCode: string]: Banner[];
    }> {
        const qb = this.bannerLocationRepository.createQueryBuilder('location');
        qb.where('location.status = :status', { status: BasicStatus.Active });
        
        if (locationCode) {
            qb.andWhere('location.code = :code', { code: locationCode });
        }

        const locations = await qb.getMany();
        const result: { [locationCode: string]: Banner[] } = {};

        // Tận dụng getList cho mỗi location
        for (const location of locations) {
            const bannerResult = await this.getList(
                { location_id: location.id } as any,
                { limit: 1000, page: 1 }
            );

            if (bannerResult.data.length > 0) {
                result[location.code] = bannerResult.data;
            }
        }

        return result;
    }

    async findBannerById(id: number): Promise<Banner> {
        // Tận dụng getOne với relations và filters
        const banner = await this.getOne(
            { id, status: BasicStatus.Active } as any,
            { relations: ['location'] }
        );

        if (!banner) {
            throw new NotFoundException(`Banner với ID ${id} không tồn tại hoặc không hoạt động`);
        }

        return banner;
    }
}