import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseUtil } from '@/common/utils/response.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Kiểm tra xem exceptionResponse đã có format ApiResponse chưa (từ ResponseUtil)
    // Nếu có các trường: success, code, httpStatus, timestamp thì là ApiResponse format
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'success' in exceptionResponse &&
      'code' in exceptionResponse &&
      'timestamp' in exceptionResponse
    ) {
      // Đã là ApiResponse format rồi, dùng luôn
      response.status(status).json(exceptionResponse);
      return;
    }

    // Extract error details (cho trường hợp exception thông thường)
    let message = exception.message;
    let errors: any = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errorObj = exceptionResponse as any;
      message = errorObj.message || message;
      errors = errorObj.errors || errorObj.error || null;

      // Handle validation errors from class-validator
      if (Array.isArray(errorObj.message)) {
        message = 'Validation failed';
        errors = errorObj.message;
      }
    }

    // Log the error (mask sensitive fields; reduce verbosity in production)
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const logPayload = {
      path: request.url,
      method: request.method,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: isProd ? this.sanitizeBody(request.body) : this.sanitizeBody(request.body),
      params: request.params,
      query: request.query,
      headers: this.sanitizeHeaders(request.headers),
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      JSON.stringify(logPayload),
      exception.stack,
    );

    // Create standardized error response
    const errorResponse = ResponseUtil.error(message, 'ERROR', status, errors);

    response.status(status).json(errorResponse);
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const SENSITIVE_KEYS = [
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
    ];
    // Các trường quan trọng cần giữ nguyên giá trị để debug
    const IMPORTANT_FIELDS = [
      'gallery',
      'category_ids',
      'status',
      'is_featured',
      'is_variable',
      'is_digital'
    ];
    const clone: any = Array.isArray(body) ? [] : {};
    Object.keys(body).forEach((key) => {
      if (SENSITIVE_KEYS.includes(key)) {
        clone[key] = '[REDACTED]';
      } else if (IMPORTANT_FIELDS.includes(key)) {
        // Giữ nguyên giá trị của các trường quan trọng để debug
        clone[key] = (body as any)[key];
      } else {
        const val = (body as any)[key];
        if (val && typeof val === 'object') {
          // shallow mask nested objects
          clone[key] = '[OBJECT]';
        } else {
          clone[key] = val;
        }
      }
    });
    return clone;
  }
}
