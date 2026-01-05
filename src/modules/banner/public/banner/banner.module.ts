import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicBannerService } from '@/modules/banner/public/banner/services/banner.service';
import { PublicBannerController } from '@/modules/banner/public/banner/controllers/banner.controller';
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Banner, BannerLocation])],
    controllers: [PublicBannerController],
    providers: [PublicBannerService],
    exports: [PublicBannerService],
})
export class PublicBannerModule { }