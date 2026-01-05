import { FindOptionsWhere } from 'typeorm';

/**
 * Sort Options Interface
 */
export interface SortOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Filter Options Interface
 */
export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';
  value: any;
}

/**
 * Filters - Điều kiện tìm kiếm (conditions)
 * Có thể dùng object key-value đơn giản hoặc FilterOptions[] nâng cao
 */
export type Filters<T> = 
  | Partial<Record<keyof T, any>>
  | FindOptionsWhere<T>
  | FindOptionsWhere<T>[]
  | FilterOptions[];

/**
 * Relation Options Interface
 */
export interface RelationOptions {
  name: string;
  select?: string[];
  where?: Record<string, any>;
}

/**
 * Options - Các tùy chọn phân trang, sắp xếp, relations, etc.
 */
export interface Options {
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  // Accepts: "field:ASC" | "field" (defaults DESC) | array of them | or structured SortOptions[]
  sort?: string | string[] | SortOptions[];
  // Relations
  // Accepts: ["author", { name: "category", select: ["id", "name"], where: { status: ... } }]
  relations?: Array<string | RelationOptions>;
  // Other
  select?: string[];
  includeDeleted?: boolean;
  
  // Performance & Optimization Options
  // Maximum limit to prevent memory issues (default: 1000)
  maxLimit?: number;
  // Enable query caching (default: false)
  enableCache?: boolean;
  // Cache TTL in seconds (default: 300 = 5 minutes)
  cacheTTL?: number;
}

/**
 * Interface tối giản cho list query (Legacy - compatibility)
 */
export interface FindAllOptions<T = any> extends Options {
  filters?: Filters<T>;
}

/**
 * Interface for paginated list result
 */
export interface PaginatedListResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
  };
}

