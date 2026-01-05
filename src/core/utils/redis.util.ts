import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisUtil implements OnModuleDestroy {
  private client: RedisClient | null = null;
  private readonly url: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.url = process.env.REDIS_URL || this.configService.get<string>('REDIS_URL');
    if (this.url) {
      this.client = new Redis(this.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        retryStrategy: (times) => {
          // exponential backoff up to ~10s
          const delay = Math.min(times * 200, 10_000);
          return delay;
        },
      });
    }
  }

  isEnabled(): boolean {
    return !!this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];
    return this.client.keys(pattern);
  }

  async onModuleDestroy() {
    if (this.client) {
      try { await this.client.quit(); } catch {}
      this.client = null;
    }
  }
}


