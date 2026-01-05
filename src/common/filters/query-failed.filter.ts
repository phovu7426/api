import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { ResponseUtil } from '@/common/utils/response.util';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database query failed';
    let errors: any = null;

    // Handle specific database errors
    const error = exception as any;
    const code = error.code || error.errno;

    switch (code) {
      case 'ER_DUP_ENTRY':
      case '23000':
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry detected';
        errors = this.extractDuplicateKeyInfo(error.message);
        break;
        
      case 'ER_NO_REFERENCED_ROW_2':
      case '23503':
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
        break;
        
      case 'ER_ROW_IS_REFERENCED_2':
        status = HttpStatus.CONFLICT;
        message = 'Cannot delete record - it is referenced by other records';
        break;
        
      case 'ER_DATA_TOO_LONG':
        status = HttpStatus.BAD_REQUEST;
        message = 'Data too long for column';
        break;
        
      case 'ER_BAD_NULL_ERROR':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required field cannot be null';
        break;
        
      case 'ER_NO_DEFAULT_FOR_FIELD':
        status = HttpStatus.BAD_REQUEST;
        message = 'Field requires a value';
        break;
        
      case 'ECONNREFUSED':
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection failed';
        break;
        
      case 'ER_ACCESS_DENIED_ERROR':
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database access denied';
        break;
        
      default:
        // Log unknown database errors for debugging
        this.logger.error(
          'Unknown database error:',
          JSON.stringify({
            code,
            message: error.message,
            sql: error.sql,
            parameters: error.parameters,
          }),
          (error && error.stack) || undefined,
        );
        break;
    }

    // Log the database error (avoid leaking sensitive parameters in production)
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const safeParams = isProd ? this.sanitizeDbParams(error.parameters) : error.parameters;

    this.logger.error(
      `Database Error: ${code} - ${message}`,
      JSON.stringify({
        path: request.url,
        method: request.method,
        sql: error.sql,
        parameters: safeParams,
        driverError: isProd ? undefined : error.driverError,
        timestamp: new Date().toISOString(),
      }),
      (error && error.stack) || undefined,
    );

    // Create standardized error response
    const errorResponse = ResponseUtil.error(message, 'ERROR', status, errors);

    response.status(status).json(errorResponse);
  }

  private extractDuplicateKeyInfo(message: string): any {
    // Extract information from MySQL duplicate key error message
    // Example: "Duplicate entry 'test@example.com' for key 'users.email'"
    const match = message.match(/Duplicate entry '(.+)' for key '(.+)'/);
    
    if (match) {
      return {
        field: match[2].split('.')[1] || match[2],
        value: match[1],
        constraint: match[2],
      };
    }

    return { message: 'Duplicate entry detected' };
  }

  private sanitizeDbParams(params: any): any {
    if (!params) return params;
    if (Array.isArray(params)) return params.map(() => '[REDACTED]');
    if (typeof params === 'object') {
      const copy: any = {};
      Object.keys(params).forEach((k) => (copy[k] = '[REDACTED]'));
      return copy;
    }
    return '[REDACTED]';
  }
}
