import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from '@/modules/post/public/post/services/post.service';
import { GetPostsDto } from '@/modules/post/public/post/dtos/get-posts.dto';
import { GetPostDto } from '@/modules/post/public/post/dtos/get-post.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('public/posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: GetPostsDto) {
    const { filters, options } = prepareQuery(query);
    return this.postService.getList(filters, options);
  }

  @Permission('public')
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    return this.postService.getList(
      { is_featured: true },
      { page: 1, limit: limit ? parseInt(limit, 10) : 5 }
    );
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param(ValidationPipe) dto: GetPostDto) {
    return this.postService.getOne({ slug: dto.slug, status: 'published' } as any);
  }
}

