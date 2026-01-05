import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ensureDatabaseUrl, buildDatabaseUrlFromConfig } from './prisma-env-setup';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        // CRITICAL: Ensure DATABASE_URL is set BEFORE creating PrismaService
        // This must be done synchronously before any PrismaClient instantiation
        ensureDatabaseUrl(configService);

        // Verify DATABASE_URL is set
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl || dbUrl.trim() === '') {
          const databaseUrl = buildDatabaseUrlFromConfig(configService);
          throw new Error(
            `Failed to set DATABASE_URL. Expected: ${databaseUrl}, Got: ${process.env.DATABASE_URL}`,
          );
        }

        // Log for debugging (remove in production)
        console.log('[PrismaModule] DATABASE_URL set:', dbUrl.replace(/:[^:@]*@/, ':****@'));

        // Double-check and force set DATABASE_URL
        process.env.DATABASE_URL = dbUrl;

        // Create and return PrismaService instance
        // PrismaService constructor will verify DATABASE_URL is set before calling super()
        return new PrismaService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}


