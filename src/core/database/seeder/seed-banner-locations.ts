import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedBannerLocations {
    private readonly logger = new Logger(SeedBannerLocations.name);

    constructor(private readonly dataSource: DataSource) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banner locations...');

        const bannerLocationRepository = this.dataSource.getRepository(BannerLocation);
        const userRepo = this.dataSource.getRepository(User);

        // Check if banner locations already exist
        const existingCount = await bannerLocationRepository.count();
        if (existingCount > 0) {
            this.logger.log(`Banner locations already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        // Get admin user for audit fields
        const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
        const defaultUserId = adminUser?.id ?? 1;

        const bannerLocations = [
            {
                code: 'home_slider',
                name: 'Slider trang chủ',
                description: 'Slider hiển thị ở trang chủ',
                status: BasicStatus.Active,
            },
            {
                code: 'product_page_banner',
                name: 'Banner trang sản phẩm',
                description: 'Banner hiển thị ở trang danh sách sản phẩm',
                status: BasicStatus.Active,
            },
            {
                code: 'product_detail_banner',
                name: 'Banner chi tiết sản phẩm',
                description: 'Banner hiển thị ở trang chi tiết sản phẩm',
                status: BasicStatus.Active,
            },
            {
                code: 'about_us_banner',
                name: 'Banner giới thiệu',
                description: 'Banner hiển thị ở trang giới thiệu',
                status: BasicStatus.Active,
            },
            {
                code: 'contact_banner',
                name: 'Banner liên hệ',
                description: 'Banner hiển thị ở trang liên hệ',
                status: BasicStatus.Active,
            },
            {
                code: 'blog_banner',
                name: 'Banner blog',
                description: 'Banner hiển thị ở trang blog',
                status: BasicStatus.Active,
            },
            {
                code: 'checkout_banner',
                name: 'Banner thanh toán',
                description: 'Banner hiển thị ở trang thanh toán',
                status: BasicStatus.Active,
            },
            {
                code: 'sidebar_banner',
                name: 'Banner sidebar',
                description: 'Banner hiển thị ở sidebar',
                status: BasicStatus.Active,
            },
        ];

        for (const bannerLocationData of bannerLocations) {
            const bannerLocation = bannerLocationRepository.create({
                ...bannerLocationData,
                created_user_id: defaultUserId,
                updated_user_id: defaultUserId,
            });
            await bannerLocationRepository.save(bannerLocation);
            this.logger.log(`Created banner location: ${bannerLocationData.name} (${bannerLocationData.code})`);
        }

        this.logger.log(`Banner locations seeding completed. Created ${bannerLocations.length} banner locations.`);
    }
}