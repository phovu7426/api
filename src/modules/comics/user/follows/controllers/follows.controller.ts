import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from '@/modules/comics/user/follows/services/follows.service';
import { Permission } from '@/common/decorators/rbac.decorators';

@Controller('user/follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) { }

  @Permission('comic.read')
  @Get()
  async getList() {
    const userId = 1; // TODO: Get from request context
    return this.followsService.getByUser(userId);
  }

  @Permission('comic.read')
  @Post('comics/:comicId')
  async follow(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.followsService.follow(comicId);
  }

  @Permission('comic.read')
  @Delete('comics/:comicId')
  async unfollow(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.followsService.unfollow(comicId);
  }

  @Permission('comic.read')
  @Get('comics/:comicId/is-following')
  async isFollowing(@Param('comicId', ParseIntPipe) comicId: number) {
    return { is_following: await this.followsService.isFollowing(comicId) };
  }
}



