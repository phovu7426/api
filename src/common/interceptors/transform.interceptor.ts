import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ResponseUtil, ApiResponse } from '@/common/utils/response.util';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // If data is already in ApiResponse format, return as is
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }

        // Check if data has paginated structure with data and meta
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          // For paginated responses, use ResponseUtil.success to preserve meta
          return ResponseUtil.success(data.data, 'Success', 'SUCCESS', 200, data.meta);
        }

        // Check if data has message and data structure (from service)
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          // Use message from service and always include meta object
          return ResponseUtil.success(data.data, data.message, 'SUCCESS', 200, {});
        }

        // Transform data based on HTTP status code
        const statusCode = response.statusCode;
        
        if (statusCode >= 200 && statusCode < 300) {
          // Success responses
          if (statusCode === 201) {
            return ResponseUtil.created(data);
          }
          // Always include meta object for consistency
          return ResponseUtil.success(data, 'Success', 'SUCCESS', 200, {});
        } else if (statusCode >= 400) {
          // Error responses (though these should be handled by exception filters)
          return ResponseUtil.error('Request failed', 'REQUEST_FAILED', statusCode, data);
        }

        // Default success response with meta
        return ResponseUtil.success(data, 'Success', 'SUCCESS', 200, {});
      }),
      catchError((error) => {
        // Convert thrown errors to appropriate HTTP exceptions
        if (error.message) {
          if (error.message.includes('không tồn tại') || error.message.includes('not found')) {
            return throwError(() => new NotFoundException(error.message));
          } else if (error.message.includes('không có quyền') || error.message.includes('unauthorized')) {
            return throwError(() => new UnauthorizedException(error.message));
          } else {
            return throwError(() => new BadRequestException(error.message));
          }
        }
        return throwError(() => error);
      })
    );
  }
}
