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
import { ComicCategoriesService } from '@/modules/comics/admin/comic-categories/services/comic-categories.service';
import { CreateComicCategoryDto } from '@/modules/comics/admin/comic-categories/dtos/create-comic-category.dto';
import { UpdateComicCategoryDto } from '@/modules/comics/admin/comic-categories/dtos/update-comic-category.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('admin/comic-categories')
export class ComicCategoriesController {
  constructor(private readonly comicCategoriesService: ComicCategoriesService) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.comicCategoriesService.getList(filters, options);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.comicCategoriesService.getOne({ id });
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateComicCategoryDto) {
    return this.comicCategoriesService.create(dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateComicCategoryDto,
  ) {
    return this.comicCategoriesService.update(id, dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_category_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.comicCategoriesService.delete(id);
  }
}



