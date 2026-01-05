import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';
import { ChapterStatus } from '@/shared/enums';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Injectable()
export class ChaptersService extends CrudService<Chapter> {
  private get pageRepo(): Repository<ChapterPage> {
    return this.repository.manager.getRepository(ChapterPage);
  }

  constructor(
    @InjectRepository(Chapter) protected readonly repo: Repository<Chapter>,
    private readonly notificationService: ComicNotificationService,
  ) {
    super(repo);
  }

  /**
   * Override để load relations trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['comic', 'pages'],
    } as any;
  }

  /**
   * Hook trước khi tạo - validate chapter_index unique
   */
  protected async beforeCreate(entity: Chapter, createDto: DeepPartial<Chapter>): Promise<boolean> {
    const comicId = (createDto as any).comic_id;
    const chapterIndex = (createDto as any).chapter_index;

    if (comicId && chapterIndex) {
      const existing = await this.repo.findOne({
        where: { comic_id: comicId, chapter_index: chapterIndex } as any,
      });
      if (existing) {
        throw new BadRequestException(`Chapter với index ${chapterIndex} đã tồn tại trong comic này`);
      }
    }

    return true;
  }

  /**
   * Sau khi tạo: xử lý pages nếu có và notify nếu published
   */
  protected async afterCreate(entity: Chapter, createDto: DeepPartial<Chapter>): Promise<void> {
    const pages = (createDto as any).pages as any[] | undefined;
    if (pages && Array.isArray(pages) && pages.length > 0) {
      const pageEntities = pages.map((page, index) =>
        this.pageRepo.create({
          chapter_id: entity.id,
          page_number: index + 1,
          image_url: page.image_url,
          width: page.width,
          height: page.height,
          file_size: page.file_size,
        })
      );
      await this.pageRepo.save(pageEntities);
    }

    // Notify followers nếu chapter được publish ngay
    if (entity.status === ChapterStatus.PUBLISHED) {
      await this.notificationService.notifyNewChapter(entity);
    }
  }

  /**
   * Override getOne để load relations và verify ownership
   */
  override async getOne(where: any, options?: any): Promise<Chapter | null> {
    const adminOptions = {
      ...options,
      relations: ['comic', 'pages'],
    };
    const chapter = await super.getOne(where, adminOptions);
    // Chapter có team_id (group_id), nhưng có thể null, skip ownership check
    return chapter;
  }

  /**
   * Override beforeUpdate để verify ownership
   */
  protected override async beforeUpdate(
    entity: Chapter,
    updateDto: DeepPartial<Chapter>,
    response?: any
  ): Promise<boolean> {
    // Chapter có team_id (group_id), nhưng có thể null, skip ownership check
    
    // Validate chapter_index unique nếu có thay đổi
    if ((updateDto as any).chapter_index !== undefined && (updateDto as any).chapter_index !== entity.chapter_index) {
      const existing = await this.repo.findOne({
        where: { comic_id: entity.comic_id, chapter_index: (updateDto as any).chapter_index } as any,
      });
      if (existing && existing.id !== entity.id) {
        throw new BadRequestException(`Chapter với index ${(updateDto as any).chapter_index} đã tồn tại trong comic này`);
      }
    }
    
    return true;
  }

  /**
   * Override afterUpdate để notify khi status thay đổi từ draft -> published
   */
  protected override async afterUpdate(
    entity: Chapter,
    updateDto: DeepPartial<Chapter>,
    response?: any
  ): Promise<void> {
    // Notify nếu status thay đổi sang published
    if ((updateDto as any).status === ChapterStatus.PUBLISHED) {
      // Reload entity để có đầy đủ thông tin
      const updatedChapter = await this.getOne({ id: entity.id });
      if (updatedChapter) {
        await this.notificationService.notifyNewChapter(updatedChapter);
      }
    }
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(
    entity: Chapter,
    response?: any
  ): Promise<boolean> {
    // Chapter có team_id (group_id), nhưng có thể null, skip ownership check
    return true;
  }

  /**
   * Upload/Update pages cho chapter
   */
  async updatePages(chapterId: number, pages: Array<{
    image_url: string;
    width?: number;
    height?: number;
    file_size?: number;
  }>) {
    const chapter = await this.getOne({ id: chapterId });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    // Chapter có team_id (group_id), nhưng có thể null, skip ownership check

    // Xóa pages cũ
    await this.pageRepo.delete({ chapter_id: chapterId });

    // Tạo pages mới
    if (pages && pages.length > 0) {
      const pageEntities = pages.map((page, index) =>
        this.pageRepo.create({
          chapter_id: chapterId,
          page_number: index + 1,
          image_url: page.image_url,
          width: page.width,
          height: page.height,
          file_size: page.file_size,
        })
      );
      await this.pageRepo.save(pageEntities);
    }

    return this.getOne({ id: chapterId });
  }

  /**
   * Get pages của chapter
   */
  async getPages(chapterId: number) {
    const chapter = await this.getOne({ id: chapterId });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    return this.pageRepo.find({
      where: { chapter_id: chapterId },
      order: { page_number: 'ASC' },
    });
  }

  /**
   * Restore chapter
   */
  async restore(id: number) {
    const chapter = await this.repo.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    await this.repo.restore(id);
    await this.getOne({ id });
    return { restored: true };
  }
}

