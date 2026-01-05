import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { PostTag } from '@/shared/entities/post-tag.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedPostTags {
  private readonly logger = new Logger(SeedPostTags.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding post tags...');

    const tagRepo = this.dataSource.getRepository(PostTag);
    const userRepo = this.dataSource.getRepository(User);

    // Check if tags already exist
    const existingTags = await tagRepo.count();
    if (existingTags > 0) {
      this.logger.log('Post tags already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Seed 30 tags
    const tagsData = [
      { name: 'JavaScript', slug: 'javascript', description: 'JavaScript related content', status: 'active' },
      { name: 'TypeScript', slug: 'typescript', description: 'TypeScript related content', status: 'active' },
      { name: 'Node.js', slug: 'nodejs', description: 'Node.js related content', status: 'active' },
      { name: 'NestJS', slug: 'nestjs', description: 'NestJS framework content', status: 'active' },
      { name: 'React', slug: 'react', description: 'React library content', status: 'active' },
      { name: 'Vue.js', slug: 'vuejs', description: 'Vue.js framework content', status: 'active' },
      { name: 'Angular', slug: 'angular', description: 'Angular framework content', status: 'active' },
      { name: 'Database', slug: 'database', description: 'Database related content', status: 'active' },
      { name: 'MySQL', slug: 'mysql', description: 'MySQL database', status: 'active' },
      { name: 'PostgreSQL', slug: 'postgresql', description: 'PostgreSQL database', status: 'active' },
      { name: 'MongoDB', slug: 'mongodb', description: 'MongoDB database', status: 'active' },
      { name: 'API', slug: 'api', description: 'API development content', status: 'active' },
      { name: 'RESTful', slug: 'restful', description: 'REST API design', status: 'active' },
      { name: 'GraphQL', slug: 'graphql', description: 'GraphQL API', status: 'active' },
      { name: 'Microservices', slug: 'microservices', description: 'Microservices architecture', status: 'active' },
      { name: 'Docker', slug: 'docker', description: 'Docker containerization', status: 'active' },
      { name: 'Kubernetes', slug: 'kubernetes', description: 'Kubernetes orchestration', status: 'active' },
      { name: 'AWS', slug: 'aws', description: 'Amazon Web Services', status: 'active' },
      { name: 'Azure', slug: 'azure', description: 'Microsoft Azure', status: 'active' },
      { name: 'Git', slug: 'git', description: 'Version control with Git', status: 'active' },
      { name: 'GitHub', slug: 'github', description: 'GitHub platform', status: 'active' },
      { name: 'Testing', slug: 'testing', description: 'Software testing', status: 'active' },
      { name: 'TDD', slug: 'tdd', description: 'Test Driven Development', status: 'active' },
      { name: 'Security', slug: 'security', description: 'Security best practices', status: 'active' },
      { name: 'Performance', slug: 'performance', description: 'Performance optimization', status: 'active' },
      { name: 'Best Practices', slug: 'best-practices', description: 'Coding best practices', status: 'active' },
      { name: 'Tutorial', slug: 'tutorial', description: 'Tutorial content', status: 'active' },
      { name: 'Tips & Tricks', slug: 'tips-tricks', description: 'Tips and tricks', status: 'active' },
      { name: 'News', slug: 'news', description: 'Technology news', status: 'active' },
      { name: 'Trending', slug: 'trending', description: 'Trending topics', status: 'active' },
    ];

    for (const tagData of tagsData) {
      const tag = tagRepo.create({
        name: tagData.name,
        slug: tagData.slug,
        description: tagData.description,
        status: tagData.status === 'active' ? BasicStatus.Active : BasicStatus.Inactive,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      await tagRepo.save(tag);
      this.logger.log(`Created tag: ${tag.name}`);
    }

    this.logger.log(`Post tags seeding completed - Total: ${tagsData.length}`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing post tags...');
    const tagRepo = this.dataSource.getRepository(PostTag);
    await tagRepo.clear();
    this.logger.log('Post tags cleared');
  }
}
