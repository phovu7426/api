import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  httpStatus: number;
  data: T | null;
  meta: object;
  timestamp: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ResponseUtil {
  private static now(): string {
    const tz = process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh';
    const date = new Date();
    // Format YYYY-MM-DDTHH:mm:ss+07:00 (VN has fixed +07:00, no DST)
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    // If timezone is VN, force +07:00 suffix; else fall back to local offset
    if (tz === 'Asia/Ho_Chi_Minh') {
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
    }
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const offH = pad(Math.floor(abs / 60));
    const offM = pad(abs % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;
  }
  /**
   * Create a success response
   */
  static success<T>(data?: T, message = 'Success', code = 'SUCCESS', httpStatus = 200, meta?: object): ApiResponse<T> {
    return {
      success: true,
      message,
      code,
      httpStatus,
      data: data || null,
      meta: meta || {},
      timestamp: this.now(),
    };
  }

  /**
   * Create an error response
   */
  static error(message = 'Error', code = 'ERROR', httpStatus = HttpStatus.BAD_REQUEST, errors?: any): ApiResponse<null> {
    return {
      success: false,
      message,
      code,
      httpStatus,
      data: null,
      meta: errors || {},
      timestamp: this.now(),
    };
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
    message = 'Success',
    code = 'SUCCESS',
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const meta: PaginationMeta = {
      currentPage,
      itemCount: data.length,
      itemsPerPage,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return this.success(data, message, code, HttpStatus.OK, meta);
  }

  /**
   * Create a created response (201)
   */
  static created<T>(data?: T, message = 'Created'): ApiResponse<T> {
    return this.success(data, message, 'CREATED', HttpStatus.CREATED);
  }

  /**
   * Create an updated response
   */
  static updated<T>(data?: T, message = 'Updated'): ApiResponse<T> {
    return this.success(data, message, 'UPDATED', HttpStatus.OK);
  }

  /**
   * Create a deleted response
   */
  static deleted(message = 'Deleted'): ApiResponse<null> {
    return this.success(null, message, 'DELETED', HttpStatus.OK);
  }

  /**
   * Create a not found response
   */
  static notFound(message = 'Not found'): ApiResponse<null> {
    return this.error(message, 'NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  /**
   * Create a validation error response
   */
  static validationError(errors: any, message = 'Validation failed'): ApiResponse<null> {
    return this.error(message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST, errors);
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message = 'Forbidden'): ApiResponse<null> {
    return this.error(message, 'FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message = 'Unauthorized'): ApiResponse<null> {
    return this.error(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Create a bad request response
   */
  static badRequest(message = 'Bad request', errors?: any): ApiResponse<null> {
    return this.error(message, 'BAD_REQUEST', HttpStatus.BAD_REQUEST, errors);
  }

  /**
   * Create an internal server error response
   */
  static internalServerError(message = 'Internal server error'): ApiResponse<null> {
    return this.error(message, 'INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * Create a conflict response
   */
  static conflict(message = 'Conflict'): ApiResponse<null> {
    return this.error(message, 'CONFLICT', HttpStatus.CONFLICT);
  }

  /**
   * Create a too many requests response
   */
  static tooManyRequests(message = 'Too many requests'): ApiResponse<null> {
    return this.error(message, 'TOO_MANY_REQUESTS', HttpStatus.TOO_MANY_REQUESTS);
  }

  /**
   * Create an invalid query response for pagination errors
   */
  static invalidQuery(message = 'Invalid query parameters'): ApiResponse<null> {
    return this.error(message, 'INVALID_QUERY', HttpStatus.BAD_REQUEST);
  }

  /**
   * Transform any data into a standardized response format
   */
  static transform<T>(
    data: T,
    success = true,
    message?: string,
    code?: string,
    httpStatus?: number,
    meta?: object,
    errors?: any,
  ): ApiResponse<T> {
    return {
      success,
      message: message || (success ? 'Success' : 'Error'),
      code: code || (success ? 'SUCCESS' : 'ERROR'),
      httpStatus: httpStatus || (success ? HttpStatus.OK : HttpStatus.BAD_REQUEST),
      data: success ? data : null,
      meta: meta || {},
      timestamp: this.now(),
    };
  }
}
