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
import { BannerService } from '@/modules/banner/admin/banner/services/banner.service';
import { CreateBannerDto } from '@/modules/banner/admin/banner/dtos/create-banner.dto';
import { UpdateBannerDto } from '@/modules/banner/admin/banner/dtos/update-banner.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BannerController {
    constructor(private readonly bannerService: BannerService) { }

    @LogRequest()
    @Post()
    @Permission('banner.manage')
    create(@Body(ValidationPipe) createBannerDto: CreateBannerDto) {
        return this.bannerService.create(createBannerDto);
    }

    @Get()
    @Permission('banner.manage')
    findAll(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerService.getList(filters, options);
    }

    @Get('simple')
    @Permission('banner.manage')
    getSimpleList(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerService.getSimpleList(filters, options);
    }

    // Specific routes MUST come before parameterized routes
    @Get('location/:locationCode')
    @Permission('banner.manage')
    findByLocationCode(@Param('locationCode') locationCode: string) {
        return this.bannerService.findByLocationCode(locationCode);
    }

    @Get(':id')
    @Permission('banner.manage')
    findOne(@Param('id') id: string) {
        return this.bannerService.getOne({ id: +id } as any);
    }

    @LogRequest()
    @Put(':id')
    @Permission('banner.manage')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerDto: UpdateBannerDto,
    ) {
        return this.bannerService.update(+id, updateBannerDto);
    }

    @LogRequest()
    @Delete(':id')
    @Permission('banner.manage')
    remove(@Param('id') id: string) {
        return this.bannerService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    @Permission('banner.manage')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerService.changeStatus(+id, status);
    }

    @LogRequest()
    @Put(':id/sort-order')
    @Permission('banner.manage')
    updateSortOrder(
        @Param('id') id: string,
        @Body('sort_order') sortOrder: number,
    ) {
        return this.bannerService.updateSortOrder(+id, sortOrder);
    }
}
