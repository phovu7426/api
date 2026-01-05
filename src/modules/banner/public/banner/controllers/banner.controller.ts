import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicBannerService } from '@/modules/banner/public/banner/services/banner.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('public/banners')
export class PublicBannerController {
    constructor(private readonly bannerService: PublicBannerService) { }

    @Permission('public')
    @Get('location/:locationCode')
    findByLocationCode(@Param('locationCode') locationCode: string) {
        return this.bannerService.findByLocationCode(locationCode);
    }

    @Permission('public')
    @Get()
    findActiveBanners(@Query('locationCode') locationCode?: string) {
        return this.bannerService.findActiveBanners(locationCode);
    }

    @Permission('public')
    @Get(':id')
    findBannerById(@Param('id') id: string) {
        return this.bannerService.findBannerById(+id);
    }
}