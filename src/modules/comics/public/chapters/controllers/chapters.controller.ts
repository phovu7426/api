import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  Body,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublicChaptersService } from '@/modules/comics/public/chapters/services/chapters.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { ViewTrackingService } from '@/modules/comics/core/services/view-tracking.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('public/chapters')
export class PublicChaptersController {
  constructor(
    private readonly chaptersService: PublicChaptersService,
    private readonly viewTrackingService: ViewTrackingService,
  ) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.chaptersService.getList(filters, options);
  }

  @Permission('public')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getOne({ id });
  }

  @Permission('public')
  @Get(':id/pages')
  async getPages(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getPages(id);
  }

  @Permission('public')
  @Get(':id/next')
  async getNext(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getNext(id);
  }

  @Permission('public')
  @Get(':id/prev')
  async getPrev(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getPrev(id);
  }

  @Permission('public')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 views per minute per IP
  @Post(':id/view')
  async trackView(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const chapter = await this.chaptersService.getOne({ id });
    if (!chapter) {
      return { tracked: false };
    }

    return this.viewTrackingService.trackView({
      comic_id: chapter.comic_id,
      chapter_id: id,
      user_id: req.user?.id,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });
  }
}

