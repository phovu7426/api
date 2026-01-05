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
import { PostTagService } from '@/modules/post/admin/post-tag/services/post-tag.service';
import { CreatePostTagDto } from '@/modules/post/admin/post-tag/dtos/create-post-tag.dto';
import { UpdatePostTagDto } from '@/modules/post/admin/post-tag/dtos/update-post-tag.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/post-tags')
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) { }

  @Permission('post_tag.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postTagService.getList(filters, options);
  }

  @Permission('post_tag.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postTagService.getSimpleList(filters, options);
  }

  @Permission('post_tag.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postTagService.getOne({ id });
  }

  @Permission('post_tag.manage')
  @LogRequest()
  @Post()
  async create(@Body(ValidationPipe) createDto: CreatePostTagDto) {
    return this.postTagService.create(createDto as any);
  }

  @Permission('post_tag.manage')
  @LogRequest()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdatePostTagDto,
  ) {
    return this.postTagService.update(id, updateDto as any);
  }

  @Permission('post_tag.manage')
  @LogRequest()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postTagService.delete(id);
  }
}

