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
import { PostService } from '@/modules/post/admin/post/services/post.service';
import { CreatePostDto } from '@/modules/post/admin/post/dtos/create-post.dto';
import { UpdatePostDto } from '@/modules/post/admin/post/dtos/update-post.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Permission('post.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postService.getList(filters, options);
  }

  @Permission('post.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postService.getSimpleList(filters, options);
  }

  @Permission('post.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getOne({ id });
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreatePostDto) {
    return this.postService.create(dto as any);
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePostDto,
  ) {
    return this.postService.update(id, dto as any);
  }

  @Permission('post.manage')
  @LogRequest({ fileBaseName: 'post_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postService.delete(id);
  }
}

