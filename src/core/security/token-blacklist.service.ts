import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenBlacklistService.name);
  
  // Local fallback with TTL (token -> expiresAt in epoch seconds)
  private readonly localMap = new Map<string, number>();
  
  // Configuration
  private readonly MAX_ENTRIES = 10000; // Giới hạn số lượng tokens trong memory
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisUtil,
  ) {}

  /**
   * Initialize cleanup interval khi module start
   */
  onModuleInit() {
    // Cleanup expired tokens mỗi 5 phút
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
    
    this.logger.log('TokenBlacklistService initialized with automatic cleanup');
  }

  /**
   * Cleanup khi module destroy
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    // Clear all entries
    this.localMap.clear();
    this.logger.log('TokenBlacklistService destroyed');
  }

  /**
   * Cleanup expired tokens và enforce size limit
   */
  private cleanupExpired(): void {
    const now = Math.floor(Date.now() / 1000);
    let removed = 0;
    
    // Remove expired tokens
    for (const [token, exp] of this.localMap.entries()) {
      if (exp <= now) {
        this.localMap.delete(token);
        removed++;
      }
    }
    
    // Enforce size limit using LRU eviction
    if (this.localMap.size > this.MAX_ENTRIES) {
      const toRemove = this.localMap.size - this.MAX_ENTRIES;
      
      // Sort by expiry time (oldest first)
      const entries = Array.from(this.localMap.entries())
        .sort((a, b) => a[1] - b[1]);
      
      // Remove oldest entries
      for (let i = 0; i < toRemove; i++) {
        this.localMap.delete(entries[i][0]);
        removed++;
      }
      
      this.logger.warn(
        `Token blacklist exceeded max size (${this.MAX_ENTRIES}). ` +
        `Evicted ${toRemove} oldest entries.`
      );
    }
    
    if (removed > 0) {
      this.logger.log(
        `Cleaned up ${removed} tokens. ` +
        `Current size: ${this.localMap.size}/${this.MAX_ENTRIES}`
      );
    }
  }

  private buildKey(token: string): string {
    return `auth:blacklist:${token}`;
  }

  /**
   * Add a token to blacklist with TTL
   */
  async add(token: string, ttlSeconds: number): Promise<void> {
    const key = this.buildKey(token);
    if (this.redis && this.redis.isEnabled()) {
      await this.redis.set(key, '1', ttlSeconds).catch(() => this.addLocal(token, ttlSeconds));
    } else {
      this.addLocal(token, ttlSeconds);
    }
  }

  /**
   * Check blacklist in-memory only (fast path)
   */
  isBlacklisted(token: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    const exp = this.localMap.get(token);
    if (!exp) return false;
    if (exp <= now) {
      this.localMap.delete(token);
      return false;
    }
    return true;
  }

  /**
   * Check blacklist with Redis (fallback to in-memory)
   */
  async has(token: string): Promise<boolean> {
    if (this.redis && this.redis.isEnabled()) {
      const key = this.buildKey(token);
      const val = await this.redis.get(key);
      if (val) return true;
    }
    return this.isBlacklisted(token);
  }

  private addLocal(token: string, ttlSeconds: number): void {
    // Check size limit trước khi add
    if (this.localMap.size >= this.MAX_ENTRIES) {
      // Force cleanup nếu đạt limit
      this.cleanupExpired();
      
      // Nếu vẫn đầy sau cleanup, xóa entry cũ nhất
      if (this.localMap.size >= this.MAX_ENTRIES) {
        const oldestEntry = Array.from(this.localMap.entries())
          .sort((a, b) => a[1] - b[1])[0];
        
        if (oldestEntry) {
          this.localMap.delete(oldestEntry[0]);
          this.logger.warn(
            `Evicted oldest token to make room. ` +
            `Size: ${this.localMap.size}/${this.MAX_ENTRIES}`
          );
        }
      }
    }
    
    const now = Math.floor(Date.now() / 1000);
    this.localMap.set(token, now + Math.max(1, ttlSeconds | 0));
  }

  /**
   * Get current blacklist statistics (for monitoring)
   */
  getStats(): {
    size: number;
    maxSize: number;
    utilizationPercent: number;
    redisEnabled: boolean;
  } {
    return {
      size: this.localMap.size,
      maxSize: this.MAX_ENTRIES,
      utilizationPercent: (this.localMap.size / this.MAX_ENTRIES) * 100,
      redisEnabled: this.redis?.isEnabled() || false,
    };
  }
}


