import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { CrudService } from '@/common/base/services/crud.service';
import { Filters, Options } from '@/common/base/interfaces/list.interface';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';

@Injectable()
export class BannerService extends CrudService<Banner> {
    constructor(
        @InjectRepository(Banner)
        protected readonly bannerRepository: Repository<Banner>,
        @InjectRepository(BannerLocation)
        private readonly bannerLocationRepository: Repository<BannerLocation>,
    ) {
        super(bannerRepository);
    }

    /**
     * Hook: Validate location_id trước khi tạo banner
     */
    protected async beforeCreate(
        entity: Banner,
        createDto: DeepPartial<Banner>,
        response?: ResponseRef<Banner | null>
    ): Promise<boolean> {
        if (createDto.location_id) {
            const location = await this.bannerLocationRepository.findOne({
                where: { id: createDto.location_id as any },
            });

            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${createDto.location_id} không tồn tại`);
            }
        }

        return true;
    }

    /**
     * Hook: Validate location_id trước khi cập nhật banner
     */
    protected async beforeUpdate(
        entity: Banner,
        updateDto: DeepPartial<Banner>,
        response?: ResponseRef<Banner | null>
    ): Promise<boolean> {
        if (updateDto.location_id && updateDto.location_id !== entity.location_id) {
            const location = await this.bannerLocationRepository.findOne({
                where: { id: updateDto.location_id as any },
            });

            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${updateDto.location_id} không tồn tại`);
            }
        }

        return true;
    }

    /**
     * Override prepareFilters: Nếu filter theo status Active, thêm date range filter
     * Admin xem tất cả banners, nhưng khi lọc Active thì cần check date range
     */
    protected prepareFilters(filters?: Filters<Banner>, options?: Options): any {
        if (filters && (filters as any).status === BasicStatus.Active) {
            const now = new Date();
            return {
                ...filters,
                start_date: Or(IsNull(), LessThanOrEqual(now)),
                end_date: Or(IsNull(), MoreThanOrEqual(now)),
            };
        }
        return filters;
    }

    /**
     * Override prepareOptions để thêm relations và sort mặc định
     */
    protected prepareOptions(queryOptions: any = {}): any {
        const options = super.prepareOptions(queryOptions);
        
        // Thêm relation location mặc định
        if (!options.relations || options.relations.length === 0) {
            options.relations = ['location'];
        }

        // Thêm sort mặc định theo sort_order và created_at
        if (!options.sort) {
            options.sort = ['sort_order:ASC', 'created_at:DESC'];
        }

        return options;
    }

    /**
     * Lấy banner theo location code
     */
    async findByLocationCode(locationCode: string): Promise<Banner[]> {
        const location = await this.bannerLocationRepository.findOne({
            where: { code: locationCode, status: BasicStatus.Active },
        });

        if (!location) {
            throw new NotFoundException(`Vị trí banner với mã "${locationCode}" không tồn tại hoặc không hoạt động`);
        }

        // Tận dụng getList với filters (date range sẽ được filter ở DB level)
        const result = await this.getList(
            { location_id: location.id, status: BasicStatus.Active } as any,
            { limit: 1000, page: 1 }
        );

        return result.data;
    }

    /**
     * Thay đổi trạng thái banner
     */
    async changeStatus(id: number, status: BasicStatus) {
        return this.update(id, { status } as any);
    }

    /**
     * Cập nhật thứ tự sắp xếp banner
     */
    async updateSortOrder(id: number, sortOrder: number) {
        return this.update(id, { sort_order: sortOrder } as any);
    }
}
