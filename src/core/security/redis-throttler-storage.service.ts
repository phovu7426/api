import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisUtil } from '@/core/utils/redis.util';

// ThrottlerStorageRecord interface (not exported from @nestjs/throttler)
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class RedisThrottlerStorageService implements ThrottlerStorage {
  constructor(private readonly redis: RedisUtil) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    // If Redis is not enabled, fallback to allow all requests
    if (!this.redis.isEnabled()) {
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }

    try {
      const redisKey = `throttler:${throttlerName}:${key}`;
      const blockKey = `throttler:${throttlerName}:block:${key}`;
      
      // Check if currently blocked
      const blockData = await this.redis.get(blockKey);
      const now = Math.floor(Date.now() / 1000);
      
      if (blockData) {
        const blockUntil = parseInt(blockData, 10);
        if (blockUntil > now) {
          return {
            totalHits: limit,
            timeToExpire: 0,
            isBlocked: true,
            timeToBlockExpire: blockUntil - now,
          };
        } else {
          // Block expired, remove it
          await this.redis.del(blockKey);
        }
      }

      // Get current count
      const currentData = await this.redis.get(redisKey);
      let totalHits = 0;
      
      if (currentData) {
        totalHits = parseInt(currentData, 10);
      }

      // Check if already at or above limit (before incrementing)
      if (totalHits >= limit) {
        // Already at limit, block immediately
        const blockUntil = now + Math.floor(blockDuration / 1000);
        await this.redis.set(blockKey, blockUntil.toString(), Math.ceil(blockDuration / 1000));
        
        return {
          totalHits: limit,
          timeToExpire: 0,
          isBlocked: true,
          timeToBlockExpire: Math.ceil(blockDuration / 1000),
        };
      }

      // Increment count
      totalHits += 1;

      // Update count with TTL
      const ttlSeconds = Math.ceil(ttl / 1000);
      await this.redis.set(redisKey, totalHits.toString(), ttlSeconds);

      return {
        totalHits,
        timeToExpire: ttlSeconds,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    } catch (error) {
      // On error, allow the request (fail open)
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}

