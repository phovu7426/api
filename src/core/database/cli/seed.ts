import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { SeedService } from '@/core/database/seeder/seed-data';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedCLI');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const refreshFlag = args.includes('--refresh') || args.includes('-r');

  try {
    if (refreshFlag) {
      logger.log('🔄 Refresh mode: Clearing existing data before seeding...');
    } else {
      logger.log('🚀 Starting database seeding...');
    }

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const seedService = app.get(SeedService);

    // Clear database if refresh flag is set
    if (refreshFlag) {
      logger.log('🗑️  Clearing all existing data...');
      await seedService.clearAll();
      logger.log('✅ Database cleared successfully');
    }

    // Seed database
    await seedService.seedAll();

    logger.log('✅ Database seeding completed successfully!');

    if (refreshFlag) {
      logger.log('✨ Database has been refreshed and seeded!');
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();
