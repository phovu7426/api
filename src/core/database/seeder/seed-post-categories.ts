import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { PostCategory } from '@/shared/entities/post-category.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedPostCategories {
  private readonly logger = new Logger(SeedPostCategories.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding post categories...');

    const categoryRepo = this.dataSource.getRepository(PostCategory);
    const userRepo = this.dataSource.getRepository(User);

    // Check if categories already exist
    const existingCategories = await categoryRepo.count();
    if (existingCategories > 0) {
      this.logger.log('Post categories already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Seed 30 categories - mix of parent and child categories
    const categoriesData = [
      // Technology categories
      { name: 'Công nghệ', slug: 'cong-nghe', description: 'Các bài viết về công nghệ', status: 'active', sort_order: 1, parent_slug: null },
      { name: 'Lập trình', slug: 'lap-trinh', description: 'Các bài viết về lập trình', status: 'active', sort_order: 2, parent_slug: 'cong-nghe' },
      { name: 'Web Development', slug: 'web-development', description: 'Phát triển web', status: 'active', sort_order: 3, parent_slug: 'lap-trinh' },
      { name: 'Mobile Development', slug: 'mobile-development', description: 'Phát triển ứng dụng mobile', status: 'active', sort_order: 4, parent_slug: 'lap-trinh' },
      { name: 'Backend Development', slug: 'backend-development', description: 'Phát triển backend', status: 'active', sort_order: 5, parent_slug: 'lap-trinh' },
      { name: 'Frontend Development', slug: 'frontend-development', description: 'Phát triển frontend', status: 'active', sort_order: 6, parent_slug: 'lap-trinh' },
      { name: 'DevOps', slug: 'devops', description: 'DevOps và CI/CD', status: 'active', sort_order: 7, parent_slug: 'cong-nghe' },
      { name: 'Cloud Computing', slug: 'cloud-computing', description: 'Điện toán đám mây', status: 'active', sort_order: 8, parent_slug: 'cong-nghe' },

      // Programming languages
      { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming', status: 'active', sort_order: 9, parent_slug: 'lap-trinh' },
      { name: 'TypeScript', slug: 'typescript', description: 'TypeScript programming', status: 'active', sort_order: 10, parent_slug: 'lap-trinh' },
      { name: 'Python', slug: 'python', description: 'Python programming', status: 'active', sort_order: 11, parent_slug: 'lap-trinh' },
      { name: 'Java', slug: 'java', description: 'Java programming', status: 'active', sort_order: 12, parent_slug: 'lap-trinh' },
      { name: 'PHP', slug: 'php', description: 'PHP programming', status: 'active', sort_order: 13, parent_slug: 'lap-trinh' },

      // Frameworks
      { name: 'Node.js', slug: 'nodejs', description: 'Node.js framework', status: 'active', sort_order: 14, parent_slug: 'backend-development' },
      { name: 'NestJS', slug: 'nestjs', description: 'NestJS framework', status: 'active', sort_order: 15, parent_slug: 'backend-development' },
      { name: 'React', slug: 'react', description: 'React library', status: 'active', sort_order: 16, parent_slug: 'frontend-development' },
      { name: 'Vue.js', slug: 'vuejs', description: 'Vue.js framework', status: 'active', sort_order: 17, parent_slug: 'frontend-development' },
      { name: 'Angular', slug: 'angular', description: 'Angular framework', status: 'active', sort_order: 18, parent_slug: 'frontend-development' },

      // Database
      { name: 'Database', slug: 'database', description: 'Cơ sở dữ liệu', status: 'active', sort_order: 19, parent_slug: 'cong-nghe' },
      { name: 'MySQL', slug: 'mysql', description: 'MySQL database', status: 'active', sort_order: 20, parent_slug: 'database' },
      { name: 'PostgreSQL', slug: 'postgresql', description: 'PostgreSQL database', status: 'active', sort_order: 21, parent_slug: 'database' },
      { name: 'MongoDB', slug: 'mongodb', description: 'MongoDB database', status: 'active', sort_order: 22, parent_slug: 'database' },

      // Design & UI/UX
      { name: 'Thiết kế', slug: 'thiet-ke', description: 'Thiết kế đồ họa và UI/UX', status: 'active', sort_order: 23, parent_slug: null },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Thiết kế giao diện', status: 'active', sort_order: 24, parent_slug: 'thiet-ke' },
      { name: 'Graphic Design', slug: 'graphic-design', description: 'Thiết kế đồ họa', status: 'active', sort_order: 25, parent_slug: 'thiet-ke' },

      // Business & Marketing
      { name: 'Kinh doanh', slug: 'kinh-doanh', description: 'Kinh doanh và Marketing', status: 'active', sort_order: 26, parent_slug: null },
      { name: 'Digital Marketing', slug: 'digital-marketing', description: 'Marketing số', status: 'active', sort_order: 27, parent_slug: 'kinh-doanh' },
      { name: 'SEO', slug: 'seo', description: 'Tối ưu hóa công cụ tìm kiếm', status: 'active', sort_order: 28, parent_slug: 'kinh-doanh' },
      { name: 'Content Marketing', slug: 'content-marketing', description: 'Marketing nội dung', status: 'active', sort_order: 29, parent_slug: 'kinh-doanh' },
    ];

    const createdCategories: Map<string, PostCategory> = new Map();

    // Create categories in order (parents first)
    const sortedCategories = this.sortCategoriesByParent(categoriesData);

    for (const categoryData of sortedCategories) {
      let parentCategory: PostCategory | null = null;
      if (categoryData.parent_slug) {
        parentCategory = createdCategories.get(categoryData.parent_slug) || null;
        if (!parentCategory) {
          this.logger.warn(`Parent category not found for ${categoryData.slug}, skipping parent relation`);
        }
      }

      const category = categoryRepo.create({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        status: categoryData.status === 'active' ? BasicStatus.Active : BasicStatus.Inactive,
        sort_order: categoryData.sort_order,
        parent: parentCategory,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      const saved = await categoryRepo.save(category);
      createdCategories.set(saved.slug, saved);
      this.logger.log(`Created category: ${saved.name}${parentCategory ? ` (parent: ${parentCategory.name})` : ''}`);
    }

    this.logger.log(`Post categories seeding completed - Total: ${createdCategories.size}`);
  }

  private sortCategoriesByParent(categories: Array<{ slug: string, parent_slug: string | null }>): Array<any> {
    const result: any[] = [];
    const processed = new Set<string>();
    const categoryMap = new Map(categories.map(c => [c.slug, c]));

    // First pass: add all categories without parents
    for (const cat of categories) {
      if (!cat.parent_slug) {
        result.push(cat);
        processed.add(cat.slug);
      }
    }

    // Subsequent passes: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const cat of categories) {
        if (!processed.has(cat.slug)) {
          if (!cat.parent_slug || processed.has(cat.parent_slug)) {
            result.push(cat);
            processed.add(cat.slug);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing post categories...');
    const categoryRepo = this.dataSource.getRepository(PostCategory);
    await categoryRepo.clear();
    this.logger.log('Post categories cleared');
  }
}
