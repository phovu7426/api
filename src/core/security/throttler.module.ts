import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';
import { RedisUtil } from '@/core/utils/redis.util';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [RedisUtil],
      useFactory: (redis: RedisUtil) => {
        // Use Redis storage if available, otherwise fallback to in-memory
        const storage = redis.isEnabled()
          ? new RedisThrottlerStorageService(redis)
          : undefined; // undefined = use default in-memory storage

        return {
          throttlers: [{
            ttl: 60000, // 60 seconds = 1 phút
            limit: 50, // Default limit: 50 request mỗi phút cho mỗi IP
          }],
          storage,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class RateLimitModule { }