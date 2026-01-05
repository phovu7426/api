import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from '@/modules/banner/admin/banner/services/banner.service';
import { BannerController } from '@/modules/banner/admin/banner/controllers/banner.controller';
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Banner, BannerLocation]),
        RbacModule,
    ],
    controllers: [BannerController],
    providers: [BannerService],
    exports: [BannerService],
})
export class AdminBannerModule { }