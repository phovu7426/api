/**
 * DataLoader Utility - Giải quyết N+1 Query Problem
 * 
 * Batch và cache database queries để giảm số lượng queries
 * Thay vì query N lần cho N items, chỉ query 1 lần cho tất cả
 */

export interface BatchLoadFn<K, V> {
  (keys: readonly K[]): Promise<(V | Error)[]>;
}

export interface DataLoaderOptions {
  /**
   * Batch multiple loads trong cùng event loop tick
   * Default: true
   */
  batch?: boolean;

  /**
   * Cache kết quả để tránh load lại
   * Default: true
   */
  cache?: boolean;

  /**
   * Max batch size
   * Default: Infinity
   */
  maxBatchSize?: number;

  /**
   * Custom cache key function
   */
  cacheKeyFn?: (key: any) => any;
}

/**
 * DataLoader implementation
 * Giải quyết N+1 query problem bằng cách batch và cache requests
 */
export class DataLoader<K, V> {
  private batchLoadFn: BatchLoadFn<K, V>;
  private options: Required<DataLoaderOptions>;
  private cache: Map<any, Promise<V>>;
  private queue: Array<{
    key: K;
    resolve: (value: V) => void;
    reject: (error: Error) => void;
  }>;
  private batchScheduled: boolean;

  constructor(batchLoadFn: BatchLoadFn<K, V>, options: DataLoaderOptions = {}) {
    this.batchLoadFn = batchLoadFn;
    this.options = {
      batch: options.batch !== false,
      cache: options.cache !== false,
      maxBatchSize: options.maxBatchSize || Infinity,
      cacheKeyFn: options.cacheKeyFn || ((key: any) => key),
    };
    this.cache = new Map();
    this.queue = [];
    this.batchScheduled = false;
  }

  /**
   * Load a single value
   */
  async load(key: K): Promise<V> {
    if (!this.options.batch) {
      return this.loadSingle(key);
    }

    const cacheKey = this.options.cacheKeyFn(key);

    // Check cache first
    if (this.options.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Create promise for this key
    const promise = new Promise<V>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Schedule batch if not already scheduled
      if (!this.batchScheduled) {
        this.batchScheduled = true;
        process.nextTick(() => {
          this.dispatchBatch();
        });
      }
    });

    // Cache the promise
    if (this.options.cache) {
      this.cache.set(cacheKey, promise);
    }

    return promise;
  }

  /**
   * Load multiple values
   */
  async loadMany(keys: K[]): Promise<(V | Error)[]> {
    return Promise.all(
      keys.map((key) =>
        this.load(key).catch((error) => error)
      )
    );
  }

  /**
   * Clear cache for a specific key
   */
  clear(key: K): this {
    const cacheKey = this.options.cacheKeyFn(key);
    this.cache.delete(cacheKey);
    return this;
  }

  /**
   * Clear all cache
   */
  clearAll(): this {
    this.cache.clear();
    return this;
  }

  /**
   * Prime cache with a value
   */
  prime(key: K, value: V): this {
    const cacheKey = this.options.cacheKeyFn(key);
    this.cache.set(cacheKey, Promise.resolve(value));
    return this;
  }

  /**
   * Load single value without batching
   */
  private async loadSingle(key: K): Promise<V> {
    const results = await this.batchLoadFn([key]);
    const result = results[0];

    if (result instanceof Error) {
      throw result;
    }

    return result;
  }

  /**
   * Dispatch batched requests
   */
  private async dispatchBatch(): Promise<void> {
    this.batchScheduled = false;

    const queue = this.queue;
    this.queue = [];

    if (queue.length === 0) {
      return;
    }

    // Split into batches if needed
    const batches: typeof queue[] = [];
    for (let i = 0; i < queue.length; i += this.options.maxBatchSize) {
      batches.push(queue.slice(i, i + this.options.maxBatchSize));
    }

    // Process each batch
    for (const batch of batches) {
      const keys = batch.map((item) => item.key);

      try {
        const results = await this.batchLoadFn(keys);

        // Validate results length
        if (results.length !== keys.length) {
          throw new Error(
            `DataLoader batch function must return array of same length as keys. ` +
            `Expected ${keys.length}, got ${results.length}`
          );
        }

        // Resolve/reject each promise
        batch.forEach((item, index) => {
          const result = results[index];

          if (result instanceof Error) {
            item.reject(result);
            // Remove from cache on error
            const cacheKey = this.options.cacheKeyFn(item.key);
            this.cache.delete(cacheKey);
          } else {
            item.resolve(result);
          }
        });
      } catch (error) {
        // Reject all promises in batch
        batch.forEach((item) => {
          item.reject(error as Error);
          // Remove from cache on error
          const cacheKey = this.options.cacheKeyFn(item.key);
          this.cache.delete(cacheKey);
        });
      }
    }
  }
}

/**
 * Helper function để group array by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => any
): Map<any, T[]> {
  const map = new Map<any, T[]>();

  for (const item of array) {
    const key = keyFn(item);
    const group = map.get(key);

    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}

/**
 * Helper function để tạo lookup map
 */
export function createLookupMap<T>(
  array: T[],
  keyFn: (item: T) => any
): Map<any, T> {
  const map = new Map<any, T>();

  for (const item of array) {
    const key = keyFn(item);
    map.set(key, item);
  }

  return map;
}
















