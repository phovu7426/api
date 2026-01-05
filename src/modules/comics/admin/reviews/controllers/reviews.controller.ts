import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewsService } from '@/modules/comics/admin/reviews/services/reviews.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.reviewsService.getList(filters, options);
  }

  @Permission('comic.manage')
  @Get('statistics')
  async getStatistics() {
    return this.reviewsService.getStatistics();
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOne({ id });
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'review_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content?: string; rating?: number },
  ) {
    return this.reviewsService.update(id, body);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'review_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.delete(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'review_restore' })
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.restore(id);
  }
}



