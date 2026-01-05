import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

async function checkMigration() {
  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'mysql') as any,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'nestjs',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    // Check if menus table exists
    const menusTableExists = await dataSource.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menus'`,
      [process.env.DB_DATABASE || 'nestjs']
    );
    console.log('📊 Menus table exists:', menusTableExists[0].count > 0);

    // Check if migration is recorded
    const migrationRecord = await dataSource.query(
      `SELECT * FROM migrations WHERE name = ?`,
      ['CreateMenuTables1742000000000']
    );
    console.log('📊 Migration record:', migrationRecord.length > 0 ? migrationRecord[0] : 'Not found');

    // Check all migrations
    const allMigrations = await dataSource.query(`SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10`);
    console.log('\n📋 Last 10 migrations:');
    allMigrations.forEach((m: any) => {
      console.log(`  - ${m.name} (timestamp: ${m.timestamp})`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMigration();

