import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';

@Injectable()
export class BannerLocationService extends CrudService<BannerLocation> {
    constructor(
        @InjectRepository(BannerLocation)
        protected readonly bannerLocationRepository: Repository<BannerLocation>,
    ) {
        super(bannerLocationRepository);
    }

    /**
     * Hook: Validate code unique trước khi tạo
     */
    protected async beforeCreate(
        entity: BannerLocation,
        createDto: DeepPartial<BannerLocation>,
        response?: ResponseRef<BannerLocation | null>
    ): Promise<boolean> {
        if (createDto.code) {
            const existingLocation = await this.bannerLocationRepository.findOne({
                where: { code: createDto.code as string },
            });

            if (existingLocation) {
                throw new ConflictException(`Mã vị trí banner "${createDto.code}" đã tồn tại`);
            }
        }

        return true;
    }

    /**
     * Hook: Validate code unique trước khi cập nhật
     */
    protected async beforeUpdate(
        entity: BannerLocation,
        updateDto: DeepPartial<BannerLocation>,
        response?: ResponseRef<BannerLocation | null>
    ): Promise<boolean> {
        if (updateDto.code && updateDto.code !== entity.code) {
            const existingLocation = await this.bannerLocationRepository.findOne({
                where: { code: updateDto.code as string },
            });

            if (existingLocation) {
                throw new ConflictException(`Mã vị trí banner "${updateDto.code}" đã tồn tại`);
            }
        }

        return true;
    }

    /**
     * Override prepareOptions để thêm sort mặc định
     */
    protected prepareOptions(queryOptions: any = {}): any {
        const options = super.prepareOptions(queryOptions);
        
        // Thêm sort mặc định theo created_at
        if (!options.sort) {
            options.sort = 'created_at:DESC';
        }

        return options;
    }

    /**
     * Thay đổi trạng thái banner location
     */
    async changeStatus(id: number, status: BasicStatus) {
        return this.update(id, { status } as any);
    }
}
