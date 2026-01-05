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
import { CommentsService } from '@/modules/comics/admin/comments/services/comments.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.commentsService.getList(filters, options);
  }

  @Permission('comic.manage')
  @Get('statistics')
  async getStatistics() {
    return this.commentsService.getStatistics();
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getOne({ id });
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comment_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { content?: string; status?: 'visible' | 'hidden' },
  ) {
    return this.commentsService.update(id, body);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comment_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.delete(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comment_restore' })
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.restore(id);
  }
}



