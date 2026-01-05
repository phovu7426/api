import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { PostCategoryService } from '@/modules/post/public/post-category/services/post-category.service';
import { GetCategoriesDto } from '@/modules/post/public/post-category/dtos/get-categories.dto';
import { GetCategoryDto } from '@/modules/post/public/post-category/dtos/get-category.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/post-categories')
export class PostCategoryController {
  constructor(private readonly postCategoryService: PostCategoryService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetCategoriesDto) {
    const { filters, options } = prepareQuery(query);
    return this.postCategoryService.getList(filters, options);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetCategoryDto) {
    return this.postCategoryService.getOne({ slug: dto.slug, status: 'published' } as any);
  }
}

