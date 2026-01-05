import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ValidationPipe,
    UseGuards,
} from '@nestjs/common';
import { BannerLocationService } from '@/modules/banner/admin/banner-location/services/banner-location.service';
import { CreateBannerLocationDto } from '@/modules/banner/admin/banner-location/dtos/create-banner-location.dto';
import { UpdateBannerLocationDto } from '@/modules/banner/admin/banner-location/dtos/update-banner-location.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';

@Controller('admin/banner-locations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BannerLocationController {
    constructor(private readonly bannerLocationService: BannerLocationService) { }

    @LogRequest()
    @Post()
    @Permission('banner_location.manage')
    create(@Body(ValidationPipe) createBannerLocationDto: CreateBannerLocationDto) {
        return this.bannerLocationService.create(createBannerLocationDto);
    }

    @Get()
    @Permission('banner_location.manage')
    findAll(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerLocationService.getList(filters, options);
    }

    @Get('simple')
    @Permission('banner_location.manage')
    getSimpleList(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerLocationService.getSimpleList(filters, options);
    }

    // Specific routes MUST come before parameterized routes
    @Get('code/:code')
    @Permission('banner_location.manage')
    findByCode(@Param('code') code: string) {
        return this.bannerLocationService.getOne({ code: code } as any);
    }

    @Get(':id')
    @Permission('banner_location.manage')
    findOne(@Param('id') id: string) {
        return this.bannerLocationService.getOne({ id: +id } as any);
    }

    @LogRequest()
    @Put(':id')
    @Permission('banner_location.manage')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerLocationDto: UpdateBannerLocationDto,
    ) {
        return this.bannerLocationService.update(+id, updateBannerLocationDto);
    }

    @LogRequest()
    @Delete(':id')
    @Permission('banner_location.manage')
    remove(@Param('id') id: string) {
        return this.bannerLocationService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    @Permission('banner_location.manage')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerLocationService.changeStatus(+id, status);
    }
}
