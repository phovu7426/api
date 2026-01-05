import 'reflect-metadata';
import { config } from 'dotenv';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

// Load environment variables từ file .env
config({ path: path.resolve(process.cwd(), '.env') });

async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_DATABASE || '';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUsername = process.env.DB_USERNAME || '';
  const dbPassword = process.env.DB_PASSWORD || '';

  // Removed console.log for production

  try {
    // Kết nối MySQL mà không chỉ định database
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUsername,
      password: dbPassword,
    });

    // Tạo database nếu chưa tồn tại
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    await connection.end();

    // Removed console.log for production
    process.exit(0);
  } catch (error: any) {
    // Removed console.error for production
    process.exit(1);
  }
}

createDatabaseIfNotExists();

