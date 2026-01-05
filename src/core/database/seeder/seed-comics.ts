import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { ComicCategory } from '@/shared/entities/comic-category.entity';
import { User } from '@/shared/entities/user.entity';
import { ComicStatus } from '@/shared/enums';

@Injectable()
export class SeedComics {
  private readonly logger = new Logger(SeedComics.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding comics...');

    const comicRepo = this.dataSource.getRepository(Comic);
    const statsRepo = this.dataSource.getRepository(ComicStats);
    const categoryRepo = this.dataSource.getRepository(ComicCategory);
    const userRepo = this.dataSource.getRepository(User);

    // Check if comics already exist
    const existingComics = await comicRepo.count();
    if (existingComics > 0) {
      this.logger.log('Comics already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Get categories
    const categories = await categoryRepo.find();
    if (categories.length === 0) {
      this.logger.warn('No comic categories found. Please seed categories first.');
      return;
    }

    // Seed comics - các truyện tranh mẫu phổ biến
    const comicsData = [
      {
        slug: 'one-piece',
        title: 'One Piece',
        description: 'Câu chuyện về Luffy và băng hải tặc Mũ Rơm trên hành trình tìm kiếm kho báu One Piece để trở thành Vua Hải Tặc.',
        author: 'Eiichiro Oda',
        status: ComicStatus.PUBLISHED,
        cover_image: 'https://via.placeholder.com/300x400?text=One+Piece',
        categorySlugs: ['action', 'adventure', 'shounen'],
        stats: { view_count: 50000, follow_count: 12000, rating_count: 8500, rating_sum: 42500 },
      },
      {
        slug: 'naruto',
        title: 'Naruto',
        description: 'Câu chuyện về Naruto Uzumaki, một ninja trẻ với ước mơ trở thành Hokage của làng Lá.',
        author: 'Masashi Kishimoto',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Naruto',
        categorySlugs: ['action', 'adventure', 'shounen'],
        stats: { view_count: 45000, follow_count: 11000, rating_count: 8000, rating_sum: 40000 },
      },
      {
        slug: 'attack-on-titan',
        title: 'Attack on Titan',
        description: 'Nhân loại sống trong thành phố được bao quanh bởi những bức tường khổng lồ để bảo vệ khỏi Titans.',
        author: 'Hajime Isayama',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Attack+on+Titan',
        categorySlugs: ['action', 'drama', 'horror', 'shounen'],
        stats: { view_count: 40000, follow_count: 10000, rating_count: 7500, rating_sum: 37500 },
      },
      {
        slug: 'demon-slayer',
        title: 'Demon Slayer',
        description: 'Câu chuyện về Tanjiro Kamado, một thanh niên trở thành thợ săn quỷ để cứu em gái khỏi lời nguyền.',
        author: 'Koyoharu Gotouge',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Demon+Slayer',
        categorySlugs: ['action', 'supernatural', 'shounen'],
        stats: { view_count: 38000, follow_count: 9500, rating_count: 7000, rating_sum: 35000 },
      },
      {
        slug: 'my-hero-academia',
        title: 'My Hero Academia',
        description: 'Trong thế giới nơi hầu hết mọi người đều có siêu năng lực, Izuku Midoriya ước mơ trở thành anh hùng.',
        author: 'Kohei Horikoshi',
        status: ComicStatus.PUBLISHED,
        cover_image: 'https://via.placeholder.com/300x400?text=My+Hero+Academia',
        categorySlugs: ['action', 'comedy', 'school', 'shounen'],
        stats: { view_count: 35000, follow_count: 9000, rating_count: 6500, rating_sum: 32500 },
      },
      {
        slug: 'jujutsu-kaisen',
        title: 'Jujutsu Kaisen',
        description: 'Yuji Itadori tham gia câu lạc bộ nghiên cứu về siêu nhiên và bị cuốn vào thế giới của các lời nguyền.',
        author: 'Gege Akutami',
        status: ComicStatus.PUBLISHED,
        cover_image: 'https://via.placeholder.com/300x400?text=Jujutsu+Kaisen',
        categorySlugs: ['action', 'horror', 'supernatural', 'shounen'],
        stats: { view_count: 32000, follow_count: 8500, rating_count: 6000, rating_sum: 30000 },
      },
      {
        slug: 'spy-x-family',
        title: 'Spy x Family',
        description: 'Một điệp viên phải tạo ra một gia đình giả để hoàn thành nhiệm vụ, nhưng không biết rằng vợ là sát thủ và con gái là người đọc được suy nghĩ.',
        author: 'Tatsuya Endo',
        status: ComicStatus.PUBLISHED,
        cover_image: 'https://via.placeholder.com/300x400?text=Spy+x+Family',
        categorySlugs: ['action', 'comedy', 'slice-of-life'],
        stats: { view_count: 30000, follow_count: 8000, rating_count: 5500, rating_sum: 27500 },
      },
      {
        slug: 'chainsaw-man',
        title: 'Chainsaw Man',
        description: 'Denji, một thanh niên nghèo hợp đồng với quỷ chainsaw để trở thành thợ săn quỷ.',
        author: 'Tatsuki Fujimoto',
        status: ComicStatus.PUBLISHED,
        cover_image: 'https://via.placeholder.com/300x400?text=Chainsaw+Man',
        categorySlugs: ['action', 'horror', 'supernatural', 'seinen'],
        stats: { view_count: 28000, follow_count: 7500, rating_count: 5000, rating_sum: 25000 },
      },
      {
        slug: 'tokyo-ghoul',
        title: 'Tokyo Ghoul',
        description: 'Ken Kaneki trở thành ghoul sau một tai nạn và phải học cách sống trong thế giới của cả con người và ghoul.',
        author: 'Sui Ishida',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Tokyo+Ghoul',
        categorySlugs: ['action', 'horror', 'supernatural', 'seinen'],
        stats: { view_count: 25000, follow_count: 7000, rating_count: 4500, rating_sum: 22500 },
      },
      {
        slug: 'death-note',
        title: 'Death Note',
        description: 'Light Yagami tìm thấy một cuốn sổ có thể giết người bằng cách viết tên vào đó.',
        author: 'Tsugumi Ohba',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Death+Note',
        categorySlugs: ['mystery', 'thriller', 'supernatural', 'shounen'],
        stats: { view_count: 22000, follow_count: 6500, rating_count: 4000, rating_sum: 20000 },
      },
      {
        slug: 'fullmetal-alchemist',
        title: 'Fullmetal Alchemist',
        description: 'Hai anh em Edward và Alphonse Elric tìm kiếm Hòn đá Triết học để khôi phục cơ thể của họ.',
        author: 'Hiromu Arakawa',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Fullmetal+Alchemist',
        categorySlugs: ['action', 'adventure', 'fantasy', 'shounen'],
        stats: { view_count: 20000, follow_count: 6000, rating_count: 3500, rating_sum: 17500 },
      },
      {
        slug: 'dragon-ball',
        title: 'Dragon Ball',
        description: 'Cuộc phiêu lưu của Goku từ khi còn nhỏ đến khi trở thành chiến binh mạnh nhất vũ trụ.',
        author: 'Akira Toriyama',
        status: ComicStatus.COMPLETED,
        cover_image: 'https://via.placeholder.com/300x400?text=Dragon+Ball',
        categorySlugs: ['action', 'adventure', 'comedy', 'shounen'],
        stats: { view_count: 18000, follow_count: 5500, rating_count: 3000, rating_sum: 15000 },
      },
    ];

    for (const comicData of comicsData) {
      // Create comic
      const comic = comicRepo.create({
        slug: comicData.slug,
        title: comicData.title,
        description: comicData.description,
        author: comicData.author,
        status: comicData.status,
        cover_image: comicData.cover_image,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });

      const savedComic = await comicRepo.save(comic);
      this.logger.log(`Created comic: ${savedComic.title}`);

      // Create stats
      const stats = statsRepo.create({
        comic_id: savedComic.id,
        view_count: comicData.stats.view_count,
        follow_count: comicData.stats.follow_count,
        rating_count: comicData.stats.rating_count,
        rating_sum: comicData.stats.rating_sum,
      });
      await statsRepo.save(stats);
      this.logger.log(`Created stats for comic: ${savedComic.title}`);

      // Assign categories
      const comicCategories = categories.filter(cat =>
        comicData.categorySlugs.includes(cat.slug)
      );
      if (comicCategories.length > 0) {
        savedComic.categories = comicCategories;
        await comicRepo.save(savedComic);
        this.logger.log(`Assigned ${comicCategories.length} categories to: ${savedComic.title}`);
      }
    }

    this.logger.log(`Comics seeding completed - Total: ${comicsData.length}`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing comics...');
    const comicRepo = this.dataSource.getRepository(Comic);
    const statsRepo = this.dataSource.getRepository(ComicStats);

    // Clear junction table first
    await this.dataSource.query('DELETE FROM comic_category');
    
    // Clear stats
    await statsRepo.clear();
    
    // Clear comics
    await comicRepo.clear();
    
    this.logger.log('Comics cleared');
  }
}

