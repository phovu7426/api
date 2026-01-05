import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from '@/app.module';
import { CustomLoggerService } from '@/core/logger/logger.service';
import { applyCors } from '@/bootstrap/cors';
import { applyHttpHardening } from '@/bootstrap/http-hardening';
import { applyGlobalPipes } from '@/bootstrap/pipes';
import { registerShutdown } from '@/bootstrap/shutdown';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Use custom logger
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // Get configuration values
  const appConfig = {
    port: configService.get('app.port', 8000),
    globalPrefix: configService.get('app.globalPrefix', 'api'),
    corsEnabled: configService.get('app.corsEnabled', true),
    corsOrigins: configService.get('app.corsOrigins', ['*']),
    environment: configService.get('app.environment', 'development'),
    name: configService.get('app.name', 'NestJS Backend'),
    version: configService.get('app.version', '1.0.0'),
    timezone: configService.get('app.timezone', 'Asia/Ho_Chi_Minh'),
  };

  // Set process timezone (best effort; DB timezone configured separately)
  try {
    process.env.TZ = appConfig.timezone;
    Logger.log(`Timezone set to ${appConfig.timezone}`, 'Application');
  } catch { }

  // Enable CORS if configured
  applyCors(app, { enabled: appConfig.corsEnabled, origins: appConfig.corsOrigins });
  if (appConfig.corsEnabled) {
    logger.log('CORS enabled', { origins: appConfig.corsOrigins });
  }

  // HTTP hardening middlewares
  applyHttpHardening(app, '10mb');

  // Rate limiting is handled by @nestjs/throttler (global guard). Remove in-memory middleware to avoid duplication.

  // Trust proxy (needed when running behind reverse proxy to get correct req.ip)
  try {
    (app as any).set('trust proxy', true);
  } catch { }

  // Suppress all native console outputs globally only in production (use CustomLoggerService instead)
  // Keep console.error and console.warn in development for debugging
  if (appConfig.environment === 'production') {
    try {
      const noop = () => { };
      (console as any).log = noop;
      (console as any).info = noop;
      // Keep warnings and errors visible in production
      // (console as any).warn = noop;
      (console as any).debug = noop;
      // Keep console.error for critical errors even in production
      // (console as any).error = noop; // Uncomment if you want to suppress all console outputs
    } catch { }
  }

  // Set global prefix
  app.setGlobalPrefix(appConfig.globalPrefix);

  // Serve static files for local storage (only if using local storage)
  const storageType = configService.get<string>('storage.type', 'local');
  if (storageType === 'local') {
    const localDestination = configService.get<string>('storage.local.destination', './storage/uploads');
    const localBaseUrl = configService.get<string>('storage.local.baseUrl', '/uploads');
    
    // Add CORS middleware for static files BEFORE serving them
    if (appConfig.corsEnabled) {
      const hasWildcard = appConfig.corsOrigins.includes('*');
      app.use(localBaseUrl, (req: Request, res: Response, next: NextFunction) => {
        // Set CORS headers
        if (hasWildcard) {
          res.setHeader('Access-Control-Allow-Origin', '*');
        } else {
          const origin = req.headers.origin;
          if (origin && appConfig.corsOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
          } else if (appConfig.corsOrigins.length > 0) {
            res.setHeader('Access-Control-Allow-Origin', appConfig.corsOrigins[0]);
          }
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
        // Override helmet's crossOriginResourcePolicy for static files
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
      });
    }
    
    // Serve static files with CORS headers in setHeaders
    app.useStaticAssets(join(process.cwd(), localDestination), {
      prefix: localBaseUrl,
      setHeaders: (res: Response) => {
        // Set CORS headers when serving static files
        if (appConfig.corsEnabled) {
          const hasWildcard = appConfig.corsOrigins.includes('*');
          if (hasWildcard) {
            res.setHeader('Access-Control-Allow-Origin', '*');
          }
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
      },
    });
  }

  // Global validation pipe with enhanced configuration
  applyGlobalPipes(app, { production: appConfig.environment === 'production' });

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start the application
  await app.listen(appConfig.port);

  const appUrl = `http://localhost:${appConfig.port}/${appConfig.globalPrefix}`;

  logger.log(`🚀 ${appConfig.name} v${appConfig.version} is running!`, {
    environment: appConfig.environment,
    port: appConfig.port,
    url: appUrl,
    globalPrefix: appConfig.globalPrefix,
    cors: appConfig.corsEnabled,
  });

  // Development-specific logging
  // Removed console.log for production

  // Graceful error and signal handling
  registerShutdown(app, logger);
}

// Register process handlers inside bootstrap to allow graceful shutdown
// Note: We keep minimal top-level handlers and attach detailed ones after app starts

bootstrap().catch((error) => {
  // Removed console.error for production
  process.exit(1);
});

