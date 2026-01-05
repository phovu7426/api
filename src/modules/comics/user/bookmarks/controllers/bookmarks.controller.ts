import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { BookmarksService } from '@/modules/comics/user/bookmarks/services/bookmarks.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('user/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) { }

  @Permission('comic.read')
  @Get()
  async getList() {
    const userId = 1; // TODO: Get from request context
    return this.bookmarksService.getByUser(userId);
  }

  @Permission('comic.read')
  @Post()
  async create(@Body(ValidationPipe) body: { chapter_id: number; page_number: number }) {
    return this.bookmarksService.create(body.chapter_id, body.page_number);
  }

  @Permission('comic.read')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarksService.delete(id);
  }
}



