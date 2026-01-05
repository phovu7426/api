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
import { PostCategoryService } from '@/modules/post/admin/post-category/services/post-category.service';
import { CreatePostCategoryDto } from '@/modules/post/admin/post-category/dtos/create-post-category.dto';
import { UpdatePostCategoryDto } from '@/modules/post/admin/post-category/dtos/update-post-category.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/post-categories')
export class PostCategoryController {
  constructor(private readonly postCategoryService: PostCategoryService) { }

  @Permission('post_category.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postCategoryService.getList(filters, options);
  }

  @Permission('post_category.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.postCategoryService.getSimpleList(filters, options);
  }

  @Permission('post_category.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postCategoryService.getOne({ id });
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Post()
  async create(@Body(ValidationPipe) createDto: CreatePostCategoryDto) {
    return this.postCategoryService.create(createDto as any);
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdatePostCategoryDto,
  ) {
    return this.postCategoryService.update(id, updateDto as any);
  }

  @Permission('post_category.manage')
  @LogRequest()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.postCategoryService.delete(id);
  }
}

