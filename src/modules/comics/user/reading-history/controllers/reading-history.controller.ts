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
import { ReadingHistoryService } from '@/modules/comics/user/reading-history/services/reading-history.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('user/reading-history')
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) { }

  @Permission('comic.read')
  @Get()
  async getList() {
    const userId = 1; // TODO: Get from request context
    return this.readingHistoryService.getByUser(userId);
  }

  @Permission('comic.read')
  @Post()
  async updateOrCreate(@Body(ValidationPipe) body: { comic_id: number; chapter_id: number }) {
    return this.readingHistoryService.updateOrCreate(body.comic_id, body.chapter_id);
  }

  @Permission('comic.read')
  @Delete(':comicId')
  async delete(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.readingHistoryService.delete(comicId);
  }
}



