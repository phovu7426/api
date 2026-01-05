import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedBannerLocations {
    private readonly logger = new Logger(SeedBannerLocations.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banner locations...');

        // Check if banner locations already exist
        const existingCount = await this.prisma.bannerLocation.count({
          where: { deleted_at: null },
        });
        if (existingCount > 0) {
            this.logger.log(`Banner locations already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        // Get admin user for audit fields
        const adminUser = await this.prisma.user.findFirst({
          where: { username: 'admin', deleted_at: null },
        });
        const defaultUserId = adminUser ? Number(adminUser.id) : 1;

        const bannerLocations = [
            {
                code: 'home_slider',
                name: 'Slider trang chủ',
                description: 'Slider hiển thị ở trang chủ',
                status: BasicStatus.active,
            },
            {
                code: 'product_page_banner',
                name: 'Banner trang sản phẩm',
                description: 'Banner hiển thị ở trang danh sách sản phẩm',
                status: BasicStatus.active,
            },
            {
                code: 'product_detail_banner',
                name: 'Banner chi tiết sản phẩm',
                description: 'Banner hiển thị ở trang chi tiết sản phẩm',
                status: BasicStatus.active,
            },
            {
                code: 'about_us_banner',
                name: 'Banner giới thiệu',
                description: 'Banner hiển thị ở trang giới thiệu',
                status: BasicStatus.active,
            },
            {
                code: 'contact_banner',
                name: 'Banner liên hệ',
                description: 'Banner hiển thị ở trang liên hệ',
                status: BasicStatus.active,
            },
            {
                code: 'blog_banner',
                name: 'Banner blog',
                description: 'Banner hiển thị ở trang blog',
                status: BasicStatus.active,
            },
            {
                code: 'checkout_banner',
                name: 'Banner thanh toán',
                description: 'Banner hiển thị ở trang thanh toán',
                status: BasicStatus.active,
            },
            {
                code: 'sidebar_banner',
                name: 'Banner sidebar',
                description: 'Banner hiển thị ở sidebar',
                status: BasicStatus.active,
            },
        ];

        for (const locationData of bannerLocations) {
            await this.prisma.bannerLocation.create({
                data: {
                    code: locationData.code,
                    name: locationData.name,
                    description: locationData.description,
                    status: locationData.status,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });
            this.logger.log(`Created banner location: ${locationData.name}`);
        }

        this.logger.log(`Banner locations seeding completed - Total: ${bannerLocations.length}`);
    }

    async clear(): Promise<void> {
        this.logger.log('Clearing banner locations...');
        await this.prisma.bannerLocation.deleteMany({});
        this.logger.log('Banner locations cleared');
    }
}
