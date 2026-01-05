import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { PublicComicCategoriesService } from '@/modules/comics/public/comic-categories/services/comic-categories.service';
import { GetComicCategoriesDto } from '@/modules/comics/public/comic-categories/dtos/get-categories.dto';
import { GetComicCategoryDto } from '@/modules/comics/public/comic-categories/dtos/get-category.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/comic-categories')
export class PublicComicCategoriesController {
  constructor(private readonly comicCategoriesService: PublicComicCategoriesService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetComicCategoriesDto) {
    const { filters, options } = prepareQuery(query);
    return this.comicCategoriesService.getList(filters, options);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetComicCategoryDto) {
    return this.comicCategoriesService.getOne({ slug: dto.slug } as any);
  }
}

