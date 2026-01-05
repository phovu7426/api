import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('DropDatabaseCLI');

  // Load environment variables từ file .env
  config({ path: path.resolve(process.cwd(), '.env') });

  const dbConfig = {
    type: (process.env.DB_TYPE || 'mysql') as any,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    timezone: process.env.DB_TIMEZONE || '+07:00',
  };

  const databaseName = dbConfig.database;

  // Create a temporary DataSource without specifying the database to connect to MySQL server
  const tempDataSource = new DataSource({
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
  });

  try {
    await tempDataSource.initialize();
    logger.log(`Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    const queryRunner = tempDataSource.createQueryRunner();

    // Check if database exists
    const [dbExists] = await queryRunner.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${databaseName}'`
    );

    if (dbExists) {
      // Drop database
      await queryRunner.query(`DROP DATABASE \`${databaseName}\``);
      logger.log(`✅ Database '${databaseName}' dropped successfully.`);
    } else {
      logger.log(`Database '${databaseName}' does not exist. Skipping drop.`);
    }

    await queryRunner.release();
    await tempDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Failed to drop database '${databaseName}':`, error);
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
    }
    process.exit(1);
  }
}

bootstrap();



