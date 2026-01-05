import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { PostTagService } from '@/modules/post/public/post-tag/services/post-tag.service';
import { GetTagsDto } from '@/modules/post/public/post-tag/dtos/get-tags.dto';
import { GetTagDto } from '@/modules/post/public/post-tag/dtos/get-tag.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/post-tags')
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetTagsDto) {
    const { filters, options } = prepareQuery(query);
    return this.postTagService.getList(filters, options);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetTagDto) {
    return this.postTagService.getOne({ slug: dto.slug, status: 'published' } as any);
  }
}

