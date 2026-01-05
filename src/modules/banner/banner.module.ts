import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import shared entities
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';

// Import admin modules
import { AdminBannerModule } from '@/modules/banner/admin/banner/banner.module';
import { AdminBannerLocationModule } from '@/modules/banner/admin/banner-location/banner-location.module';

// Import public modules
import { PublicBannerModule } from '@/modules/banner/public/banner/banner.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Banner,
            BannerLocation,
        ]),
        // Admin modules
        AdminBannerModule,
        AdminBannerLocationModule,
        // Public modules
        PublicBannerModule,
    ],
    exports: [
        // Export shared entities for other modules to use
        TypeOrmModule,
    ],
})
export class BannerModule { }