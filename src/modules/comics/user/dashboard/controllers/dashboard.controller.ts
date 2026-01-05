import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from '@/modules/comics/user/dashboard/services/dashboard.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('user/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Permission('comic.read')
  @Get()
  async getDashboard() {
    const userId = 1; // TODO: Get from request context
    return this.dashboardService.getDashboard(userId);
  }

  @Permission('comic.read')
  @Get('library')
  async getLibrary(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const userId = 1; // TODO: Get from request context
    return this.dashboardService.getLibrary(userId, page, limit);
  }
}



