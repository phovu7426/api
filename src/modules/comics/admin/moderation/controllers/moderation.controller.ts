import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ModerationService } from '@/modules/comics/admin/moderation/services/moderation.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) { }

  @Permission('comic.write')
  @Post('comments/:id/hide')
  async hideComment(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.hideComment(id);
  }

  @Permission('comic.write')
  @Post('comments/:id/show')
  async showComment(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.showComment(id);
  }

  @Permission('comic.write')
  @Post('reviews/:id/hide')
  async hideReview(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.hideReview(id);
  }

  @Permission('comic.write')
  @Get('comments/pending')
  async getPendingComments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.moderationService.getPendingComments(page, limit);
  }
}



