import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerLocationService } from '@/modules/banner/admin/banner-location/services/banner-location.service';
import { BannerLocationController } from '@/modules/banner/admin/banner-location/controllers/banner-location.controller';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([BannerLocation]),
        RbacModule,
    ],
    controllers: [BannerLocationController],
    providers: [BannerLocationService],
    exports: [BannerLocationService],
})
export class AdminBannerLocationModule { }