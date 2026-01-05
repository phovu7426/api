import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from '@/modules/comics/admin/analytics/services/analytics.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Permission('comic.read')
  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Permission('comic.read')
  @Get('comics')
  async getTopComics(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('sortBy') sortBy: 'views' | 'follows' | 'rating' = 'views',
  ) {
    return this.analyticsService.getTopComics(limit, sortBy);
  }

  @Permission('comic.read')
  @Get('views')
  async getViewsOverTime(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getViewsOverTime(
      new Date(startDate),
      new Date(endDate),
    );
  }
}



