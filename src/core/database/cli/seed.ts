import 'reflect-metadata';
// CRITICAL: Load .env file FIRST, before any other imports
// This ensures environment variables are available before PrismaClient is imported
import 'dotenv/config';

// CRITICAL: Ensure DATABASE_URL is set BEFORE importing any modules
// This must happen before PrismaClient is imported anywhere
if (!process.env.DATABASE_URL) {
  // Build DATABASE_URL from individual DB_* variables if not set
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const username = process.env.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE || '';
  const charset = process.env.DB_CHARSET || 'utf8mb4';
  const timezone = process.env.DB_TIMEZONE || '+07:00';
  const ssl = process.env.DB_SSL === 'true';

  if (username && database) {
    const encodedPassword = password ? encodeURIComponent(password) : '';
    const authPart = password ? `${username}:${encodedPassword}` : username;
    
    const params = new URLSearchParams({
      charset,
      timezone,
    });
    if (ssl) {
      params.append('sslmode', 'require');
    }
    
    process.env.DATABASE_URL = `mysql://${authPart}@${host}:${port}/${database}?${params.toString()}`;
    console.log('[SeedCLI] DATABASE_URL built from DB_* variables');
  }
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Please set DATABASE_URL or DB_* variables in .env file');
}

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
