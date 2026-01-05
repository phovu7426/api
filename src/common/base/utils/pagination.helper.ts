/**
 * Pagination metadata helper
 * Tính toán metadata cho phân trang
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  previousPage?: number;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Tạo pagination metadata từ page, limit và total
 * @param page - Trang hiện tại (bắt đầu từ 1)
 * @param limit - Số lượng items mỗi trang
 * @param total - Tổng số items
 * @returns PaginationMeta object
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : undefined,
    previousPage: page > 1 ? page - 1 : undefined,
  };
}

/**
 * Tạo paginated result với data và meta
 * @param data - Mảng dữ liệu
 * @param page - Trang hiện tại (bắt đầu từ 1)
 * @param limit - Số lượng items mỗi trang
 * @param total - Tổng số items
 * @returns PaginatedResult object với data và meta
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(page, limit, total),
  };
}

