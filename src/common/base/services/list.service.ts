import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository, ObjectLiteral, FindOptionsOrder } from 'typeorm';
import { Filters, Options, PaginatedListResult } from '@/common/base/interfaces/list.interface';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';

/**
 * List Service với các phương thức cơ bản cho việc lấy danh sách
 * 
 * ✅ SỬ DỤNG repository.find() THAY VÌ QueryBuilder
 * - Tránh lỗi "Duplicate column name" với self-referencing relations
 * - TypeORM xử lý relations tốt hơn với find()
 * - Code đơn giản, dễ maintain
 */
@Injectable()
export abstract class ListService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) { }

  /**
   * Lấy danh sách entities (phân trang, lọc, select, quan hệ, sắp xếp...)
   */
  async getList(
    filters?: Filters<T>,
    options?: Options,
  ): Promise<PaginatedListResult<T>> {
    const normalizedOptions = this.prepareOptions(options || {});
    const page = normalizedOptions.page || 1;
    const limit = normalizedOptions.limit || 10;
    const relations = this.normalizeRelations(normalizedOptions.relations || []);

    let data: T[] = [];
    let meta: PaginatedListResult<T>["meta"] = createPaginationMeta(page, limit, 0);

    // Hỗ trợ async prepareFilters (nếu prepareFilters trả về Promise thì await)
    const preparedResult = this.prepareFilters(filters, normalizedOptions);
    const prepared = preparedResult instanceof Promise ? await preparedResult : preparedResult;
    if (prepared) {
      const whereFilters = (prepared === true ? filters : prepared) as FindOptionsWhere<T>;

      // Build order options từ sort string
      const order = this.buildOrderOptions(normalizedOptions?.sort);

      // Count và find sử dụng repository methods (tránh duplicate column với QueryBuilder)
      const [rows, total] = await this.repository.findAndCount({
        where: whereFilters,
        relations,
        order,
        skip: (page - 1) * limit,
        take: limit,
        cache: normalizedOptions.enableCache ? normalizedOptions.cacheTTL || 300 : false,
      });

      data = rows;
      meta = createPaginationMeta(page, limit, total);
    }

    // Gọi hook sau khi lấy danh sách để xử lý dữ liệu
    const processedData = await this.afterGetList(data, filters, normalizedOptions);
    return { data: processedData, meta };
  }

  /**
   * Lấy danh sách entities với ít thông tin hơn (tối ưu cho performance)
   * - Mặc định không load relations (trừ khi truyền vào options.relations)
   * - Limit mặc định lớn hơn (50) vì ít dữ liệu hơn
   * - Vẫn hỗ trợ đầy đủ filters, pagination, sorting
   * - Có hook riêng afterGetSimpleList để xử lý dữ liệu
   */
  async getSimpleList(
    filters?: Filters<T>,
    options?: Options,
  ): Promise<PaginatedListResult<T>> {
    const normalizedOptions = this.prepareSimpleOptions(options || {});
    const page = normalizedOptions.page || 1;
    const limit = normalizedOptions.limit;
    const relations = this.normalizeRelations(normalizedOptions.relations || []);

    let data: T[] = [];
    let meta: PaginatedListResult<T>["meta"] = createPaginationMeta(page, limit, 0);

    // Hỗ trợ async prepareFilters (nếu prepareFilters trả về Promise thì await)
    const preparedResult = this.prepareFilters(filters, normalizedOptions);
    const prepared = preparedResult instanceof Promise ? await preparedResult : preparedResult;
    if (prepared) {
      const whereFilters = (prepared === true ? filters : prepared) as FindOptionsWhere<T>;

      // Build order options từ sort string
      const order = this.buildOrderOptions(normalizedOptions?.sort);

      // Count và find sử dụng repository methods (tránh duplicate column với QueryBuilder)
      const [rows, total] = await this.repository.findAndCount({
        where: whereFilters,
        relations, // Có thể rỗng nếu không truyền relations
        order,
        skip: (page - 1) * limit,
        take: limit,
        cache: normalizedOptions.enableCache ? normalizedOptions.cacheTTL || 300 : false,
      });

      data = rows;
      meta = createPaginationMeta(page, limit, total);
    }

    // Gọi hook riêng cho simple list (có thể override trong service con)
    const processedData = await this.afterGetSimpleList(data, filters, normalizedOptions);
    return { data: processedData, meta };
  }

  /**
   * Lấy một entity theo điều kiện
   */
  async getOne(
    where: FindOptionsWhere<T>,
    options?: Options,
  ): Promise<T | null> {
    const relations = this.normalizeRelations(options?.relations || []);
    const order = options?.sort ? this.buildOrderOptions(options.sort) : undefined;

    const entity = await this.repository.findOne({
      where,
      relations,
      order,
      cache: options?.enableCache ? options.cacheTTL || 300 : false,
    });

    if (entity) {
      return await this.afterGetOne(entity, where, options);
    }
    return null;
  }

  /**
   * Normalize relations: convert object format { name: 'parent', select: [...] } to string 'parent'
   * TypeORM's find() only accepts string[] for relations
   */
  protected normalizeRelations(relations: any[]): string[] {
    if (!Array.isArray(relations)) return [];
    
    return relations.map(rel => {
      if (typeof rel === 'string') {
        return rel;
      }
      if (rel && typeof rel === 'object' && rel.name) {
        return rel.name;
      }
      return null;
    }).filter((rel): rel is string => rel !== null);
  }

  /**
   * Build order options từ sort string (e.g. "created_at:DESC" or "id:ASC")
   */
  protected buildOrderOptions(sort?: any): FindOptionsOrder<T> {
    const order: any = {};
    const validColumns = this.repository.metadata.columns.map((c: any) => c.propertyName);
    const defaultSortColumn =
      (validColumns.includes('id') && 'id') ||
      (this.repository.metadata.primaryColumns?.[0]?.propertyName as string | undefined) ||
      (validColumns[0] as string | undefined);
    
    if (!sort) {
      if (defaultSortColumn) {
        order[defaultSortColumn] = 'DESC';
      }
      return order;
    }

    const sortArray = Array.isArray(sort) ? sort : [sort];
    
    for (const item of sortArray) {
      if (typeof item === 'string') {
        const [field, direction] = item.split(':');
        const f = (field || '').trim();
        // Validate field để tránh SQL injection & lỗi TypeORM EntityPropertyNotFoundError
        if (f && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f) && validColumns.includes(f)) {
          order[f] = (direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      } else if (typeof item === 'object' && item.field) {
        const f = String(item.field || '').trim();
        if (f && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(f) && validColumns.includes(f)) {
          order[f] = (item.direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      }
    }

    // Default to id:DESC if no valid sort
    if (Object.keys(order).length === 0) {
      if (defaultSortColumn) {
        order[defaultSortColumn] = 'DESC';
      }
    }

    return order;
  }

  /**
   * Hook được gọi sau khi lấy một entity
   * Override method này để xử lý dữ liệu sau khi lấy từ database
   * @param entity - Entity đã lấy từ database
   * @param where - Điều kiện where đã dùng để query
   * @param options - Options đã dùng để query (relations, select, sort, v.v.)
   * @returns Entity đã được xử lý
   */
  protected async afterGetOne(
    entity: T,
    where?: FindOptionsWhere<T>,
    options?: Options
  ): Promise<T> {
    // Override trong service con để xử lý dữ liệu
    return entity;
  }

  /**
   * Hook được gọi sau khi lấy danh sách entities
   * Override method này để xử lý dữ liệu sau khi lấy từ database
   * @param data - Danh sách entities đã lấy từ database
   * @param filters - Filters đã dùng để query
   * @param options - Options đã dùng để query (page, limit, relations, v.v.)
   * @returns Danh sách entities đã được xử lý
   */
  protected async afterGetList(
    data: T[],
    filters?: Filters<T>,
    options?: Options
  ): Promise<T[]> {
    // Override trong service con để xử lý dữ liệu
    return data;
  }

  /**
   * Hook được gọi sau khi lấy danh sách entities bằng getSimpleList
   * Override method này để xử lý dữ liệu sau khi lấy từ database (cho simple list)
   * Mặc định sẽ gọi afterGetList, nhưng có thể override riêng để tối ưu hơn
   * @param data - Danh sách entities đã lấy từ database
   * @param filters - Filters đã dùng để query
   * @param options - Options đã dùng để query (page, limit, relations, v.v.)
   * @returns Danh sách entities đã được xử lý
   */
  protected async afterGetSimpleList(
    data: T[],
    filters?: Filters<T>,
    options?: Options
  ): Promise<T[]> {
    // Mặc định gọi afterGetList, nhưng có thể override riêng trong service con
    return this.afterGetList(data, filters, options);
  }

  /**
   * Chuẩn hóa/merge filters trước khi build query
   * Override trong service con để thêm điều kiện mặc định hoặc chuyển đổi filters phức tạp
   */
  protected prepareFilters(
    filters?: Filters<T>,
    _options?: Options,
  ): boolean | any {
    return filters as any;
  }

  /**
   * Chuẩn bị options mặc định trước khi query list/getOne.
   * Có thể override tại service con để sinh options riêng module.
   */
  protected prepareOptions(queryOptions: any = {}): {
    page: number;
    limit: number;
    relations: string[];
    sort: any;
    maxLimit?: number;
    enableCache?: boolean;
    cacheTTL?: number;
  } {
    // Validate và normalize page
    let page = Number(queryOptions.page) || 1;
    if (page < 1 || !Number.isInteger(page) || !Number.isFinite(page)) {
      page = 1;
    }

    // Validate và normalize limit
    let limit = Number(queryOptions.limit) || 10;
    if (limit < 1 || !Number.isInteger(limit) || !Number.isFinite(limit)) {
      limit = 10;
    }

    // Giới hạn limit để tránh memory issues với large datasets
    const maxLimit = queryOptions.maxLimit || 1000;
    const finalLimit = Math.min(limit, maxLimit);

    return {
      page,
      limit: finalLimit,
      relations: [] as string[],
      sort: queryOptions.sort || 'id:DESC',
      maxLimit,
      enableCache: queryOptions.enableCache || false,
      cacheTTL: queryOptions.cacheTTL || 300, // 5 minutes default
    };
  }

  /**
   * Chuẩn bị options mặc định cho getSimpleList.
   * Mặc định không có relations để tối ưu performance.
   * Có thể override tại service con nếu cần custom logic.
   */
  protected prepareSimpleOptions(queryOptions: any = {}): {
    page: number;
    limit: number;
    relations: string[];
    sort: any;
    maxLimit?: number;
    enableCache?: boolean;
    cacheTTL?: number;
  } {
    // Validate và normalize page
    let page = Number(queryOptions.page) || 1;
    if (page < 1 || !Number.isInteger(page) || !Number.isFinite(page)) {
      page = 1;
    }

    // Validate và normalize limit (mặc định lớn hơn getList vì ít dữ liệu hơn)
    let limit = Number(queryOptions.limit) || 50;
    if (limit < 1 || !Number.isInteger(limit) || !Number.isFinite(limit)) {
      limit = 50;
    }

    // Giới hạn limit để tránh memory issues với large datasets
    const maxLimit = queryOptions.maxLimit || 1000;
    const finalLimit = Math.min(limit, maxLimit);

    return {
      page,
      limit: finalLimit,
      // Mặc định không có relations (chỉ dùng nếu user truyền vào rõ ràng)
      relations: queryOptions.relations || [],
      sort: queryOptions.sort || 'id:DESC',
      maxLimit,
      enableCache: queryOptions.enableCache || false,
      cacheTTL: queryOptions.cacheTTL || 300, // 5 minutes default
    };
  }

}
