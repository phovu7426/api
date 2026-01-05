import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables từ file .env
config({ path: path.resolve(process.cwd(), '.env') });

export default new DataSource({
  type: (process.env.DB_TYPE || 'mysql') as any,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'base',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true' || false,
  entities: [path.join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
  subscribers: [path.join(process.cwd(), 'src', 'core', 'database', 'subscribers', '*{.ts,.js}')],
  extra: {
    charset: process.env.DB_CHARSET || 'utf8mb4',
    // Use configured DB timezone (e.g., +07:00) so read/write aligns with DB local time
    timezone: process.env.DB_TIMEZONE || '+07:00',
    // Connection pool configuration
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },
});


