import { Module } from '@nestjs/common';

// Import admin modules
import { AdminBannerModule } from '@/modules/banner/admin/banner/banner.module';
import { AdminBannerLocationModule } from '@/modules/banner/admin/banner-location/banner-location.module';

// Import public modules
import { PublicBannerModule } from '@/modules/banner/public/banner/banner.module';

@Module({
    imports: [
        // Admin modules
        AdminBannerModule,
        AdminBannerLocationModule,
        // Public modules
        PublicBannerModule,
    ],
    exports: [],
})
export class BannerModule { }