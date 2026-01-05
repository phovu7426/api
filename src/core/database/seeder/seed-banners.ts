import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { BannerLinkTarget } from '@prisma/client';

@Injectable()
export class SeedBanners {
    private readonly logger = new Logger(SeedBanners.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banners...');

        // Check if banners already exist
        const existingCount = await this.prisma.banner.count({
          where: { deleted_at: null },
        });
        if (existingCount > 0) {
            this.logger.log(`Banners already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        // Get admin user for audit fields
        const adminUser = await this.prisma.user.findFirst({
          where: { username: 'admin', deleted_at: null },
        });
        const defaultUserId = adminUser ? Number(adminUser.id) : 1;

        // Get banner locations
        const homeSliderLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'home_slider', deleted_at: null },
        });
        const productPageLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'product_page_banner', deleted_at: null },
        });
        const aboutUsLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'about_us_banner', deleted_at: null },
        });
        const blogLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'blog_banner', deleted_at: null },
        });

        if (!homeSliderLocation || !productPageLocation || !aboutUsLocation || !blogLocation) {
            this.logger.error('Required banner locations not found. Please run banner locations seeder first.');
            return;
        }

        const banners = [
            // Home slider banners
            {
                title: 'Khuyến mãi đặc biệt',
                subtitle: 'Giảm giá đến 50%',
                image: '/uploads/banners/home-slider-1.jpg',
                mobile_image: '/uploads/banners/home-slider-1-mobile.jpg',
                link: '/products?sale=true',
                link_target: BannerLinkTarget.self,
                description: 'Khuyến mãi đặc biệt cho các sản phẩm nổi bật',
                button_text: 'Xem ngay',
                button_color: '#ff6b6b',
                text_color: '#ffffff',
                location_id: homeSliderLocation.id,
                sort_order: 1,
                status: BasicStatus.active,
            },
            {
                title: 'Sản phẩm mới',
                subtitle: 'Bộ sưu tập mới nhất',
                image: '/uploads/banners/home-slider-2.jpg',
                mobile_image: '/uploads/banners/home-slider-2-mobile.jpg',
                link: '/products?new=true',
                link_target: BannerLinkTarget.self,
                description: 'Khám phá bộ sưu tập sản phẩm mới nhất',
                button_text: 'Khám phá',
                button_color: '#4ecdc4',
                text_color: '#ffffff',
                location_id: homeSliderLocation.id,
                sort_order: 2,
                status: BasicStatus.active,
            },
            // Product page banner
            {
                title: 'Ưu đãi đặc biệt',
                subtitle: 'Giảm giá lên đến 30%',
                image: '/uploads/banners/product-page-banner.jpg',
                mobile_image: '/uploads/banners/product-page-banner-mobile.jpg',
                link: '/products?sale=true',
                link_target: BannerLinkTarget.self,
                description: 'Khuyến mãi cho tất cả sản phẩm',
                button_text: 'Mua ngay',
                button_color: '#ff6b6b',
                text_color: '#ffffff',
                location_id: productPageLocation.id,
                sort_order: 1,
                status: BasicStatus.active,
            },
            // About us banner
            {
                title: 'Về chúng tôi',
                subtitle: 'Câu chuyện của chúng tôi',
                image: '/uploads/banners/about-us-banner.jpg',
                mobile_image: '/uploads/banners/about-us-banner-mobile.jpg',
                link: '/about',
                link_target: BannerLinkTarget.self,
                description: 'Tìm hiểu thêm về công ty chúng tôi',
                button_text: 'Tìm hiểu thêm',
                button_color: '#4ecdc4',
                text_color: '#ffffff',
                location_id: aboutUsLocation.id,
                sort_order: 1,
                status: BasicStatus.active,
            },
            // Blog banner
            {
                title: 'Blog & Tin tức',
                subtitle: 'Cập nhật mới nhất',
                image: '/uploads/banners/blog-banner.jpg',
                mobile_image: '/uploads/banners/blog-banner-mobile.jpg',
                link: '/blog',
                link_target: BannerLinkTarget.self,
                description: 'Đọc các bài viết mới nhất từ blog của chúng tôi',
                button_text: 'Đọc thêm',
                button_color: '#ff6b6b',
                text_color: '#ffffff',
                location_id: blogLocation.id,
                sort_order: 1,
                status: BasicStatus.active,
            },
        ];

        for (const bannerData of banners) {
            await this.prisma.banner.create({
                data: {
                    title: bannerData.title,
                    subtitle: bannerData.subtitle,
                    image: bannerData.image,
                    mobile_image: bannerData.mobile_image,
                    link: bannerData.link,
                    link_target: bannerData.link_target as any,
                    description: bannerData.description,
                    button_text: bannerData.button_text,
                    button_color: bannerData.button_color,
                    text_color: bannerData.text_color,
                    location_id: bannerData.location_id,
                    sort_order: bannerData.sort_order,
                    status: bannerData.status,
                    created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                    updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
                },
            });
            this.logger.log(`Created banner: ${bannerData.title}`);
        }

        this.logger.log(`Banners seeding completed - Total: ${banners.length}`);
    }

    async clear(): Promise<void> {
        this.logger.log('Clearing banners...');
        await this.prisma.banner.deleteMany({});
        this.logger.log('Banners cleared');
    }
}
