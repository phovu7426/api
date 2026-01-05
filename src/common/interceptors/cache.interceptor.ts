import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, CacheOptions } from '@/common/decorators/cacheable.decorator';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisUtil,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Check if caching is enabled for this handler
    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheOptions || !this.redis.isEnabled()) {
      return next.handle();
    }

    // Build cache key from template and method arguments
    const cacheKey = this.buildCacheKey(
      cacheOptions.key,
      context.switchToHttp().getRequest(),
      context.getArgs(),
    );

    // Try to get from cache
    const cachedValue = await this.redis.get(cacheKey);
    if (cachedValue !== null) {
      try {
        return of(JSON.parse(cachedValue));
      } catch {
        // If parse fails, return as-is
        return of(cachedValue);
      }
    }

    // Execute method and cache result
    return next.handle().pipe(
      tap(async (data) => {
        // Don't cache null/undefined unless explicitly allowed
        if (data === null || data === undefined) {
          if (!cacheOptions.cacheNull) {
            return;
          }
        }

        try {
          await this.redis.set(
            cacheKey,
            JSON.stringify(data),
            cacheOptions.ttl,
          );
        } catch (error) {
          // Log error but don't fail the request
          // Removed console.error for production
        }
      }),
    );
  }

  /**
   * Build cache key from template and parameters
   * Example: 'product:${id}' with id=123 becomes 'product:123'
   */
  private buildCacheKey(template: string, request: any, args: any[]): string {
    let key = template;

    // Replace ${param} with actual values from request params
    const params = request.params || {};
    for (const [paramName, paramValue] of Object.entries(params)) {
      key = key.replace(new RegExp(`\\$\\{${paramName}\\}`, 'g'), String(paramValue));
    }

    // Replace ${query.param} with query values
    const query = request.query || {};
    for (const [queryName, queryValue] of Object.entries(query)) {
      key = key.replace(new RegExp(`\\$\\{query\\.${queryName}\\}`, 'g'), String(queryValue));
    }

    // Replace ${body.param} with body values
    const body = request.body || {};
    for (const [bodyName, bodyValue] of Object.entries(body)) {
      key = key.replace(new RegExp(`\\$\\{body\\.${bodyName}\\}`, 'g'), String(bodyValue));
    }

    // Replace ${args[n]} with method arguments
    args.forEach((arg, index) => {
      key = key.replace(new RegExp(`\\$\\{args\\[${index}\\]\\}`, 'g'), String(arg));
    });

    return key;
  }
}