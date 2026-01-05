/**
 * This file ensures DATABASE_URL is set in process.env before PrismaClient is imported.
 * It must be imported before any PrismaClient imports.
 */

import { ConfigService } from '@nestjs/config';

/**
 * Build DATABASE_URL from config values
 */
export function buildDatabaseUrlFromConfig(configService: ConfigService): string {
  // Check if DATABASE_URL is directly set in env
  const directUrl = process.env.DATABASE_URL;
  if (directUrl && directUrl.trim() !== '') {
    return directUrl;
  }

  // Build from individual config values
  const host = configService.get<string>('database.host') || 'localhost';
  const port = configService.get<number>('database.port') || 3306;
  const username = configService.get<string>('database.username') || '';
  const password = configService.get<string>('database.password') || '';
  const database = configService.get<string>('database.database') || '';
  const charset = configService.get<string>('database.charset') || 'utf8mb4';
  const timezone = configService.get<string>('database.timezone') || '+07:00';
  const ssl = configService.get<boolean>('database.ssl') || false;

  // Validate required fields
  if (!username) {
    throw new Error('DB_USERNAME is required to build DATABASE_URL');
  }
  if (!database) {
    throw new Error('DB_DATABASE is required to build DATABASE_URL');
  }

  // Build MySQL connection URL
  const encodedPassword = password ? encodeURIComponent(password) : '';
  const authPart = password ? `${username}:${encodedPassword}` : username;
  
  const params = new URLSearchParams({
    charset,
    timezone,
  });
  if (ssl) {
    params.append('sslmode', 'require');
  }
  
  return `mysql://${authPart}@${host}:${port}/${database}?${params.toString()}`;
}

/**
 * Ensure DATABASE_URL is set in process.env
 * This should be called before importing PrismaClient
 */
export function ensureDatabaseUrl(configService: ConfigService): void {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    const databaseUrl = buildDatabaseUrlFromConfig(configService);
    if (databaseUrl && databaseUrl.trim() !== '') {
      process.env.DATABASE_URL = databaseUrl;
    } else {
      throw new Error(
        'DATABASE_URL is required. Please set DATABASE_URL environment variable or configure DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE.',
      );
    }
  }
}

