import { Module } from '@nestjs/common';
import { BannerLocationService } from '@/modules/banner/admin/banner-location/services/banner-location.service';
import { BannerLocationController } from '@/modules/banner/admin/banner-location/controllers/banner-location.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
    ],
    controllers: [BannerLocationController],
    providers: [BannerLocationService],
    exports: [BannerLocationService],
})
export class AdminBannerLocationModule { }