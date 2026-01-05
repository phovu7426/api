import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { FollowsController } from '@/modules/comics/user/follows/controllers/follows.controller';
import { FollowsService } from '@/modules/comics/user/follows/services/follows.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComicFollow, ComicStats]),
    RbacModule,
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class UserFollowsModule {}

