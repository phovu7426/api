import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

export interface CacheOptions {
  /**
   * Cache key template. Use ${param} to reference method parameters
   * Example: 'product:${id}' or 'products:list:${page}:${limit}'
   */
  key: string;
  
  /**
   * Time to live in seconds
   */
  ttl: number;
  
  /**
   * Whether to cache null/undefined values
   */
  cacheNull?: boolean;
}

/**
 * Decorator to enable caching for a method
 * 
 * @example
 * ```typescript
 * @Cacheable({ key: 'product:${id}', ttl: 300 })
 * async getProductById(id: number) {
 *   return await this.repository.findOne({ where: { id } });
 * }
 * ```
 */
export const Cacheable = (options: CacheOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options.key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, options)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache
 * 
 * @example
 * ```typescript
 * @CacheEvict({ keys: ['product:${id}', 'products:list:*'] })
 * async updateProduct(id: number, data: any) {
 *   return await this.repository.update(id, data);
 * }
 * ```
 */
export const CacheEvict = (options: { keys: string[] }) => {
  return SetMetadata('cache:evict', options);
};