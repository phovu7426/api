import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('public/comics')
export class PublicComicsController {
  constructor(private readonly comicsService: PublicComicsService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.comicsService.getList(filters, options);
  }

  @Permission('public')
  @Get('trending')
  async getTrending(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.comicsService.getTrending(limit || 20);
  }

  @Permission('public')
  @Get('popular')
  async getPopular(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.comicsService.getPopular(limit || 20);
  }

  @Permission('public')
  @Get('newest')
  async getNewest(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.comicsService.getNewest(limit || 20);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.comicsService.getOne({ slug });
  }

  @Permission('public')
  @Get(':slug/chapters')
  async getChaptersBySlug(@Param('slug') slug: string) {
    return this.comicsService.getChaptersBySlug(slug);
  }
}

