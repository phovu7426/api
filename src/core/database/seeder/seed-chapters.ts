import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ChapterPage } from '@/shared/entities/chapter-page.entity';
import { Comic } from '@/shared/entities/comic.entity';
import { User } from '@/shared/entities/user.entity';
import { ChapterStatus } from '@/shared/enums';

@Injectable()
export class SeedChapters {
  private readonly logger = new Logger(SeedChapters.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding chapters...');

    const chapterRepo = this.dataSource.getRepository(Chapter);
    const pageRepo = this.dataSource.getRepository(ChapterPage);
    const comicRepo = this.dataSource.getRepository(Comic);
    const userRepo = this.dataSource.getRepository(User);

    // Check if chapters already exist
    const existingChapters = await chapterRepo.count();
    if (existingChapters > 0) {
      this.logger.log('Chapters already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Get all comics
    const comics = await comicRepo.find();
    if (comics.length === 0) {
      this.logger.warn('No comics found. Please seed comics first.');
      return;
    }

    // Seed chapters for each comic
    for (const comic of comics) {
      const chaptersCount = this.getChaptersCountForComic(comic.slug);
      
      for (let i = 1; i <= chaptersCount; i++) {
        // Create chapter
        const chapter = chapterRepo.create({
          comic_id: comic.id,
          title: this.generateChapterTitle(comic.slug, i),
          chapter_index: i,
          chapter_label: `Chương ${i}`,
          status: ChapterStatus.PUBLISHED,
          view_count: Math.floor(Math.random() * 5000) + 100, // Random 100-5100 views
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        });

        const savedChapter = await chapterRepo.save(chapter);
        this.logger.log(`Created chapter: ${savedChapter.title} for comic: ${comic.title}`);

        // Create pages for each chapter (random 10-30 pages)
        const pagesCount = Math.floor(Math.random() * 21) + 10;
        const pages = [];
        
        for (let pageNum = 1; pageNum <= pagesCount; pageNum++) {
          const page = pageRepo.create({
            chapter_id: savedChapter.id,
            page_number: pageNum,
            image_url: `https://via.placeholder.com/800x1200?text=${comic.title}+Ch${i}+Pg${pageNum}`,
            width: 800,
            height: 1200,
            file_size: Math.floor(Math.random() * 500000) + 100000, // Random 100KB-600KB
          });
          pages.push(page);
        }

        await pageRepo.save(pages);
        this.logger.log(`Created ${pagesCount} pages for chapter: ${savedChapter.title}`);
      }
    }

    this.logger.log('Chapters seeding completed');
  }

  /**
   * Get number of chapters to create for each comic
   */
  private getChaptersCountForComic(slug: string): number {
    // Popular comics get more chapters
    const popularComics = ['one-piece', 'naruto', 'attack-on-titan', 'demon-slayer'];
    if (popularComics.includes(slug)) {
      return Math.floor(Math.random() * 20) + 30; // 30-50 chapters
    }
    return Math.floor(Math.random() * 15) + 10; // 10-25 chapters
  }

  /**
   * Generate chapter title based on comic slug and chapter number
   */
  private generateChapterTitle(comicSlug: string, chapterIndex: number): string {
    const titles: Record<string, string[]> = {
      'one-piece': [
        'Romance Dawn',
        'Versus! Buggy the Clown!',
        'Morgan versus Luffy!',
        'Luffy\'s Past',
        'Enter the Great Swordsman!',
        'The First Person',
        'The Beast Tamer',
        'Nami',
        'The Honest Crook',
        'The Grand Line',
      ],
      'naruto': [
        'Uzumaki Naruto!',
        'Konohamaru!',
        'Sasuke Uchiha!',
        'Kakashi Hatake!',
        'The Worst Possible Ending',
        'For Your Own Dream',
        'The Path You Should Tread',
        'Life-and-Death Battles',
        'Kakashi\'s Decision',
        'A New Chapter Begins',
      ],
      'attack-on-titan': [
        'To You, in 2000 Years',
        'That Day',
        'A Dim Light Amid Despair',
        'The Night of the Closing Ceremony',
        'First Battle',
        'The World the Girl Saw',
        'Small Blade',
        'I Can Hear His Heartbeat',
        'Whereabouts of His Left Arm',
        'Response',
      ],
      'demon-slayer': [
        'Cruelty',
        'Trainer Sakonji Urokodaki',
        'Sabito and Makomo',
        'Final Selection',
        'My Own Steel',
        'Swordsman Accompanying a Demon',
        'Muzan Kibutsuji',
        'The Smell of Enchanting Blood',
        'Temari Demon and Arrow Demon',
        'Together Forever',
      ],
    };

    const comicTitles = titles[comicSlug];
    if (comicTitles && chapterIndex <= comicTitles.length) {
      return comicTitles[chapterIndex - 1];
    }

    // Default title
    return `Chapter ${chapterIndex}`;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing chapters...');
    const chapterRepo = this.dataSource.getRepository(Chapter);
    const pageRepo = this.dataSource.getRepository(ChapterPage);

    // Clear pages first (due to foreign key)
    await pageRepo.clear();
    
    // Clear chapters
    await chapterRepo.clear();
    
    this.logger.log('Chapters cleared');
  }
}

