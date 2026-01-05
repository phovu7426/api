import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Don't import PrismaClient here - import it dynamically after DATABASE_URL is set

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: any; // PrismaClient instance

  constructor(private readonly configService: ConfigService) {
    // DATABASE_URL should already be set by PrismaModule factory
    // Verify it's set before importing PrismaClient
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      // Fallback: try to build it if not set (for backward compatibility)
      const databaseUrl = PrismaService.buildDatabaseUrl(configService);
      if (databaseUrl && databaseUrl.trim() !== '') {
        process.env.DATABASE_URL = databaseUrl;
      } else {
        throw new Error(
          'DATABASE_URL is required. Please set DATABASE_URL environment variable or configure DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE.',
        );
      }
    }

    // Double-check DATABASE_URL is set and not empty
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.trim() === '') {
      throw new Error(
        `DATABASE_URL is empty or invalid. Current value: "${dbUrl}". Please check your .env file or database configuration.`,
      );
    }

    // Log DATABASE_URL for debugging (remove in production)
    console.log('[PrismaService] DATABASE_URL:', dbUrl.replace(/:[^:@]*@/, ':****@')); // Hide password

    // Prisma 7: Ensure DATABASE_URL is set in process.env
    // Make absolutely sure it's set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL !== dbUrl) {
      process.env.DATABASE_URL = dbUrl;
    }

    // CRITICAL: Set DATABASE_URL one more time right before creating PrismaClient
    // This ensures it's definitely set when PrismaClient reads it
    process.env.DATABASE_URL = dbUrl;
    
    // Verify DATABASE_URL is set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      throw new Error(`DATABASE_URL is not set! Expected: ${dbUrl}`);
    }

    // CRITICAL: Set DATABASE_URL one more time right before creating PrismaClient
    process.env.DATABASE_URL = dbUrl;
    
    // Verify DATABASE_URL is set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      throw new Error(`DATABASE_URL is not set! Expected: ${dbUrl}`);
    }

    // Dynamically import PrismaClient and adapter AFTER DATABASE_URL is set
    // Clear require cache to force re-import
    delete require.cache[require.resolve('@prisma/client')];
    const { PrismaClient } = require('@prisma/client');
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
    
    // Parse DATABASE_URL to create connection config for adapter
    const url = new URL(dbUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: url.username,
      password: url.password || '',
      database: url.pathname.slice(1), // Remove leading '/'
      connectionLimit: 10,
      connectTimeout: 30000, // 30 seconds
    };
    
    // Log connection config (without password)
    console.log('[PrismaService] MySQL connection config:', {
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      database: connectionConfig.database,
      password: connectionConfig.password ? '***' : '(empty)',
    });
    
    // PrismaMariaDb factory expects config object, not pool
    // It will create its own pool internally
    const adapterFactory = new PrismaMariaDb(connectionConfig);
    
    // Prisma 7.2.0 requires adapter to be passed to constructor
    // The adapter factory will be used by Prisma to create the actual adapter
    this.prisma = new PrismaClient({ adapter: adapterFactory } as any);

    // Note: We can't use Proxy with constructor return in NestJS
    // So we'll proxy methods manually below
  }

  async onModuleInit() {
    // Test connection and create database if not exists
    await this.ensureDatabaseExists();
    
    // Connect Prisma - adapter factory will create pool internally
    console.log('[PrismaService] Connecting Prisma Client...');
    await this.prisma.$connect();
    console.log('[PrismaService] ✅ Prisma Client connected successfully');
  }

  /**
   * Test MySQL connection and create database if it doesn't exist
   */
  private async ensureDatabaseExists() {
    const mysql = require('mysql2/promise');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    const url = new URL(dbUrl);
    const databaseName = url.pathname.slice(1); // Remove leading '/'
    
    // Create connection WITHOUT database to test server connection
    const testConfig = {
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: url.username,
      password: url.password || '',
      connectTimeout: 10000,
    };

    console.log('[PrismaService] Testing MySQL connection...', {
      host: testConfig.host,
      port: testConfig.port,
      user: testConfig.user,
    });

    let connection;
    try {
      // Test connection to MySQL server (without database)
      connection = await mysql.createConnection(testConfig);
      console.log('[PrismaService] ✅ Connected to MySQL server');

      // Check if database exists
      const [databases] = await connection.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [databaseName]
      ) as any[];

      if (databases.length === 0) {
        console.log(`[PrismaService] Database '${databaseName}' does not exist. Creating...`);
        await connection.query(
          `CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log(`[PrismaService] ✅ Database '${databaseName}' created successfully`);
      } else {
        console.log(`[PrismaService] ✅ Database '${databaseName}' already exists`);
      }

      await connection.end();
    } catch (error: any) {
      if (connection) {
        await connection.end().catch(() => {});
      }
      
      console.error('[PrismaService] ❌ Failed to connect to MySQL:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
      });
      
      throw new Error(
        `Cannot connect to MySQL server at ${testConfig.host}:${testConfig.port}. ` +
        `Please ensure MySQL is running and credentials are correct. ` +
        `Error: ${error.message}`
      );
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Proxy all PrismaClient methods and properties
  // Using Proxy object to automatically forward all property access
  private getPrismaProxy() {
    return new Proxy(this.prisma, {
      get(target, prop) {
        return (target as any)[prop];
      },
    });
  }

  // Expose PrismaClient instance directly
  // All model accessors (user, post, role, etc.) will be accessed through this
  get $prisma() {
    return this.prisma;
  }

  // Proxy common PrismaClient methods
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  get $executeRaw() {
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  get $queryRawUnsafe() {
    return this.prisma.$queryRawUnsafe.bind(this.prisma);
  }

  get $executeRawUnsafe() {
    return this.prisma.$executeRawUnsafe.bind(this.prisma);
  }

  get $connect() {
    return this.prisma.$connect.bind(this.prisma);
  }

  get $disconnect() {
    return this.prisma.$disconnect.bind(this.prisma);
  }

  // Proxy all model accessors using Proxy
  // This will automatically forward all property access to PrismaClient
  get user() { return this.prisma.user; }
  get post() { return this.prisma.post; }
  get role() { return this.prisma.role; }
  get permission() { return this.prisma.permission; }
  get rolePermission() { return this.prisma.rolePermission; }
  get profile() { return this.prisma.profile; }
  get context() { return this.prisma.context; }
  get group() { return this.prisma.group; }
  get userGroup() { return this.prisma.userGroup; }
  get userRoleAssignment() { return this.prisma.userRoleAssignment; }
  get roleContext() { return this.prisma.roleContext; }
  get postCategory() { return this.prisma.postCategory; }
  get postTag() { return this.prisma.postTag; }
  get postPostCategory() { return this.prisma.postPostCategory; }
  get postPostTag() { return this.prisma.postPostTag; }
  get menu() { return this.prisma.menu; }
  get menuPermission() { return this.prisma.menuPermission; }
  get notification() { return this.prisma.notification; }
  get contact() { return this.prisma.contact; }
  get generalConfig() { return this.prisma.generalConfig; }
  get emailConfig() { return this.prisma.emailConfig; }
  get bannerLocation() { return this.prisma.bannerLocation; }
  get banner() { return this.prisma.banner; }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  private static buildDatabaseUrl(configService: ConfigService): string {
    // Check if DATABASE_URL is directly set in env (Prisma 7 uses this)
    const directUrl = process.env.DATABASE_URL;
    if (directUrl && directUrl.trim() !== '') {
      return directUrl;
    }

    // Build from individual config values if DATABASE_URL is not set
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
    // Handle empty password: if password is empty, use format: mysql://user@host:port/db
    // Otherwise: mysql://user:password@host:port/db
    const encodedPassword = password ? encodeURIComponent(password) : '';
    const authPart = password ? `${username}:${encodedPassword}` : username;
    
    const params = new URLSearchParams({
      charset,
      timezone,
    });
    if (ssl) {
      params.append('sslmode', 'require');
    }
    
    const url = `mysql://${authPart}@${host}:${port}/${database}?${params.toString()}`;

    return url;
  }
}


