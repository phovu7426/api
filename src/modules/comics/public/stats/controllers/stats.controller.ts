import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StatsService } from '@/modules/comics/public/stats/services/stats.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('public/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  @Permission('public')
  @Get('comics/:comicId')
  async getComicStats(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.statsService.getComicStats(comicId);
  }
}



