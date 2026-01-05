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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComicsService } from '@/modules/comics/admin/comics/services/comics.service';
import { CreateComicDto } from '@/modules/comics/admin/comics/dtos/create-comic.dto';
import { UpdateComicDto } from '@/modules/comics/admin/comics/dtos/update-comic.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { UploadService } from '@/modules/file-upload/services/upload.service';

@Controller('admin/comics')
export class ComicsController {
  constructor(
    private readonly comicsService: ComicsService,
    private readonly uploadService: UploadService,
  ) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.comicsService.getList(filters, options);
  }

  @Permission('comic.manage')
  @Get('simple')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.comicsService.getSimpleList(filters, options);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.getOne({ id });
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateComicDto) {
    return this.comicsService.create(dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateComicDto,
  ) {
    return this.comicsService.update(id, dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.delete(id);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'comic_restore' })
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.comicsService.restore(id);
  }

  @Permission('comic.manage')
  @Post(':id/comic-categories')
  async assignCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { category_ids: number[] },
  ) {
    return this.comicsService.assignCategories(id, body.category_ids);
  }

  @Permission('comic.manage')
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validate image
    const { ImageValidator } = await import('@/modules/comics/core/validators/image-validator');
    ImageValidator.validate(file);

    const uploadResult = await this.uploadService.uploadFile(file);
    const comic = await this.comicsService.getOne({ id });
    if (!comic) {
      throw new Error('Comic not found');
    }

    comic.cover_image = uploadResult.url;
    return this.comicsService.update(id, { cover_image: uploadResult.url } as any);
  }

  @Permission('comic.manage')
  @Get(':comicId/chapters')
  async getChaptersByComic(@Param('comicId', ParseIntPipe) comicId: number) {
    // Sẽ được implement trong chapters service
    return { comic_id: comicId, chapters: [] };
  }
}

