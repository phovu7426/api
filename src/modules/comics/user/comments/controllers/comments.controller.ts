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
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserCommentsService } from '@/modules/comics/user/comments/services/comments.service';
import { Permission } from '@/common/decorators/rbac.decorators';
import { SanitizeHtmlPipe } from '@/modules/comics/core/pipes/sanitize-html.pipe';

@Controller('user/comments')
export class UserCommentsController {
  constructor(private readonly commentsService: UserCommentsService) { }

  @Permission('comic.read')
  @Get()
  async getMyComments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const userId = 1; // TODO: Get from request context
    return this.commentsService.getByUser(userId, page, limit);
  }

  @Permission('comic.read')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 comments per minute
  @Post()
  @UsePipes(new SanitizeHtmlPipe())
  async create(@Body(ValidationPipe) body: {
    comic_id: number;
    chapter_id?: number;
    parent_id?: number;
    content: string;
  }) {
    return this.commentsService.create(body);
  }

  @Permission('comic.read')
  @Put(':id')
  @UsePipes(new SanitizeHtmlPipe())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content: string },
  ) {
    return this.commentsService.update(id, body.content);
  }

  @Permission('comic.read')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.delete(id);
  }
}

