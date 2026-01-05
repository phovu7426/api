import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { ListService } from '@/common/base/services/list.service';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

@Injectable()
export class PublicChaptersService extends ListService<Chapter> {
  private get pageRepo(): Repository<ChapterPage> {
    return this.repository.manager.getRepository(ChapterPage);
  }

  constructor(
    @InjectRepository(Chapter) protected readonly repo: Repository<Chapter>,
  ) {
    super(repo);
  }

  /**
   * Override để chỉ lấy chapters có status public
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };
    prepared.status = PUBLIC_CHAPTER_STATUSES;
    return prepared;
  }

  /**
   * Override để load relations
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['comic', 'pages'],
    } as any;
  }

  /**
   * Lấy danh sách pages của chapter
   */
  async getPages(chapterId: number) {
    const chapter = await this.repo.findOne({
      where: { id: chapterId, status: PUBLIC_CHAPTER_STATUSES[0] } as any,
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return this.pageRepo.find({
      where: { chapter_id: chapterId },
      order: { page_number: 'ASC' },
    });
  }

  /**
   * Lấy chapter tiếp theo
   */
  async getNext(chapterId: number) {
    const chapter = await this.repo.findOne({
      where: { id: chapterId } as any,
      relations: ['comic'],
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const next = await this.repo.findOne({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: chapter.chapter_index + 1,
        status: PUBLIC_CHAPTER_STATUSES[0],
      } as any,
    });

    return next || null;
  }

  /**
   * Lấy chapter trước đó
   */
  async getPrev(chapterId: number) {
    const chapter = await this.repo.findOne({
      where: { id: chapterId } as any,
      relations: ['comic'],
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const prev = await this.repo.findOne({
      where: {
        comic_id: chapter.comic_id,
        chapter_index: chapter.chapter_index - 1,
        status: PUBLIC_CHAPTER_STATUSES[0],
      } as any,
    });

    return prev || null;
  }
}

