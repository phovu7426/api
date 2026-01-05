import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComicFollow } from '@/shared/entities/comic-follow.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class FollowsService {
  private get statsRepo(): Repository<ComicStats> {
    return this.repo.manager.getRepository(ComicStats);
  }

  constructor(
    @InjectRepository(ComicFollow) private readonly repo: Repository<ComicFollow>,
  ) {}

  async getByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['comic'],
      order: { created_at: 'DESC' },
    });
  }

  async follow(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const existing = await this.repo.findOne({
      where: { user_id: userId, comic_id: comicId },
    });

    if (existing) {
      return existing;
    }

    const follow = this.repo.create({
      user_id: userId,
      comic_id: comicId,
    });
    const saved = await this.repo.save(follow);

    // Sync follow count
    await this.syncFollowCount(comicId);

    return saved;
  }

  async unfollow(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.repo.delete({ user_id: userId, comic_id: comicId });

    // Sync follow count
    await this.syncFollowCount(comicId);

    return { deleted: true };
  }

  /**
   * Sync follow count vào comic_stats
   */
  private async syncFollowCount(comicId: number) {
    const followCount = await this.repo.count({
      where: { comic_id: comicId } as any,
    });

    let stats = await this.statsRepo.findOne({ where: { comic_id: comicId } });
    if (!stats) {
      stats = this.statsRepo.create({ comic_id: comicId });
    }
    stats.follow_count = followCount;
    await this.statsRepo.save(stats);
  }

  async isFollowing(comicId: number): Promise<boolean> {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      return false;
    }

    const follow = await this.repo.findOne({
      where: { user_id: userId, comic_id: comicId },
    });
    return !!follow;
  }
}

