import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redis: RedisUtil,
  ) {}

  /**
   * Lấy giá trị từ cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Lưu giá trị vào cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Xóa giá trị khỏi cache
   */
  async del(key: string): Promise<void> {
    try {
      // Ưu tiên dùng Redis nếu có (vì Redis có method del chắc chắn)
      if (this.redis?.isEnabled()) {
        await this.redis.del(key);
      }
      
      // Sau đó xóa trong cache manager nếu có
      if (!this.cacheManager) {
        return;
      }
      
      const cacheManagerAny = this.cacheManager as any;
      
      // Debug: log available methods trong development
      // Removed console.log for production
      
      // Kiểm tra xem method del có tồn tại không (có thể bị wrap bởi NestJS)
      if (cacheManagerAny.del && typeof cacheManagerAny.del === 'function') {
        await cacheManagerAny.del(key);
        return;
      }
      
      // Fallback: thử dùng stores nếu có (cache-manager v7+)
      if (cacheManagerAny.stores && Array.isArray(cacheManagerAny.stores)) {
        for (const store of cacheManagerAny.stores) {
          if (store && typeof store.delete === 'function') {
            await store.delete(key);
          } else if (store && typeof store.del === 'function') {
            await store.del(key);
          }
        }
        return;
      }
      
      // Fallback: thử set giá trị undefined với TTL 0 như một workaround
      if (cacheManagerAny.set && typeof cacheManagerAny.set === 'function') {
        await cacheManagerAny.set(key, undefined, 0);
      }
    } catch (error) {
      // Log error nhưng không throw để không làm gián đoạn flow
      // Chỉ log trong development để debug
      if (process.env.NODE_ENV === 'development') {
        // Removed console.warn for production
      }
    }
  }

  /**
   * Xóa tất cả cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Lấy hoặc set cache với callback
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await callback();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Xóa cache theo pattern (prefix)
   */
  async deletePattern(pattern: string): Promise<void> {
    if (this.redis?.isEnabled()) {
      const keys = await this.redis.keys(pattern);
      await Promise.all(keys.map(key => this.redis.del(key)));
    }
  }
}

