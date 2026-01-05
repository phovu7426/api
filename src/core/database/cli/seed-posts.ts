import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { SeedPosts } from '@/core/database/seeder/seed-posts';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedPostsCLI');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const refreshFlag = args.includes('--refresh') || args.includes('-r');
  const clearFlag = args.includes('--clear') || args.includes('-c');

  try {
    if (refreshFlag || clearFlag) {
      logger.log('🔄 Refresh mode: Clearing existing posts before seeding...');
    } else {
      logger.log('🚀 Starting posts seeding...');
    }

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const seedPosts = app.get(SeedPosts);

    // Clear posts if refresh/clear flag is set
    if (refreshFlag || clearFlag) {
      logger.log('🗑️  Clearing all existing posts...');
      await seedPosts.clear();
      logger.log('✅ Posts cleared successfully');
    }

    // Seed posts
    await seedPosts.seed();

    logger.log('✅ Posts seeding completed successfully!');

    if (refreshFlag || clearFlag) {
      logger.log('✨ Posts have been refreshed and seeded!');
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Posts seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();

