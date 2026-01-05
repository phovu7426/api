import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from '@/modules/comics/user/reviews/services/reviews.service';
import { Permission } from '@/common/decorators/rbac.decorators';
import { SanitizeHtmlPipe } from '@/modules/comics/core/pipes/sanitize-html.pipe';

@Controller('user/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Permission('comic.read')
  @Get()
  async getMyReviews() {
    const userId = 1; // TODO: Get from request context
    return this.reviewsService.getByUser(userId);
  }

  @Permission('comic.read')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 reviews per minute
  @Post('comics/:comicId')
  @UsePipes(new SanitizeHtmlPipe())
  async createOrUpdate(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Body(ValidationPipe) body: { rating: number; content?: string },
  ) {
    return this.reviewsService.createOrUpdate(comicId, body.rating, body.content);
  }

  @Permission('comic.read')
  @Delete('comics/:comicId')
  async delete(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.reviewsService.delete(comicId);
  }
}

