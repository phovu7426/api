import { INestApplication } from '@nestjs/common';
import { CustomLoggerService } from '@/core/logger/logger.service';

export function registerShutdown(app: INestApplication, logger: CustomLoggerService) {
  const shutdown = async (reason: string, err?: unknown) => {
    try {
      logger.error(`Shutting down gracefully due to: ${reason}`, err instanceof Error ? err.stack : undefined);
      await app.close();
    } catch {}
    finally {
      process.exit(reason === 'SIGTERM' || reason === 'SIGINT' ? 0 : 1);
    }
  };

  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection', undefined, { extra: { reason } });
    shutdown('unhandledRejection', reason as any);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error.stack, { extra: { message: error.message } });
    shutdown('uncaughtException', error);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}


