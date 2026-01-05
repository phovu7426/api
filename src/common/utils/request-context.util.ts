import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

type RequestStore = Map<string, unknown>;

const als = new AsyncLocalStorage<RequestStore>();

export const RequestContext = {
  /**
   * Initialize per-request store and run next middleware/handler within it
   */
  run(req: Request, _res: Response, next: NextFunction) {
    const store: RequestStore = new Map<string, unknown>();
    als.run(store, next);
  },

  /**
   * Set a value into current request store
   */
  set<T = unknown>(key: string, value: T): void {
    const store = als.getStore();
    if (store) {
      store.set(key, value as unknown);
    }
  },

  /**
   * Get a value from current request store
   */
  get<T = unknown>(key: string): T | undefined {
    const store = als.getStore();
    return (store?.get(key) as T | undefined) ?? undefined;
  },
};


