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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChaptersService } from '@/modules/comics/admin/chapters/services/chapters.service';
import { CreateChapterDto } from '@/modules/comics/admin/chapters/dtos/create-chapter.dto';
import { UpdateChapterDto } from '@/modules/comics/admin/chapters/dtos/update-chapter.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { UploadService } from '@/modules/file-upload/services/upload.service';

@Controller('admin/chapters')
export class ChaptersController {
  constructor(
    private readonly chaptersService: ChaptersService,
    private readonly uploadService: UploadService,
  ) { }

  @Permission('comic.manage')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.chaptersService.getList(filters, options);
  }

  @Permission('comic.manage')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getOne({ id });
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_create' })
  @Post()
  async create(@Body(ValidationPipe) dto: CreateChapterDto) {
    return this.chaptersService.create(dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_update' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, dto as any);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_delete' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.delete(id);
  }

  @Permission('comic.manage')
  @Get('comics/:comicId')
  async getByComic(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.chaptersService.getList({ comic_id: comicId }, {});
  }

  @Permission('comic.manage')
  @Put(':id/reorder')
  async reorder(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: { chapter_index: number },
  ) {
    return this.chaptersService.update(id, { chapter_index: body.chapter_index } as any);
  }

  @Permission('comic.manage')
  @Get(':id/pages')
  async getPages(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.getPages(id);
  }

  @Permission('comic.manage')
  @Post(':id/pages')
  @UseInterceptors(FilesInterceptor('files', 100))
  async uploadPages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate images
    const { ImageValidator } = await import('@/modules/comics/core/validators/image-validator');
    ImageValidator.validateMultiple(files);

    // Upload files và lấy URLs
    const uploadResults = await this.uploadService.uploadFiles(files);
    
    // Tạo pages data
    const pages = uploadResults.map((result, index) => ({
      image_url: result.url,
      width: undefined, // Có thể extract từ image metadata
      height: undefined,
      file_size: result.size,
    }));

    return this.chaptersService.updatePages(id, pages);
  }

  @Permission('comic.manage')
  @Put(':id/pages')
  async updatePages(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) body: {
      pages: Array<{
        image_url: string;
        width?: number;
        height?: number;
        file_size?: number;
      }>;
    },
  ) {
    return this.chaptersService.updatePages(id, body.pages);
  }

  @Permission('comic.manage')
  @LogRequest({ fileBaseName: 'chapter_restore' })
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.restore(id);
  }
}

