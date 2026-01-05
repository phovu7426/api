import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseUtil } from '@/common/utils/response.util';

/**
 * Catch both TypeORM QueryFailedError and Prisma errors
 */
@Catch()
export class QueryFailedFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if it's a database error (TypeORM or Prisma)
    const isTypeOrmError = exception?.constructor?.name === 'QueryFailedError';
    const isPrismaError = exception?.code && (
      exception.code.startsWith('P') || // Prisma error codes start with P
      exception.code === 'ER_DUP_ENTRY' || // MySQL duplicate entry
      exception.code === 'ER_NO_REFERENCED_ROW_2' ||
      exception.code === 'ER_ROW_IS_REFERENCED_2' ||
      exception.code === 'ER_DATA_TOO_LONG' ||
      exception.code === 'ER_BAD_NULL_ERROR' ||
      exception.code === 'ER_NO_DEFAULT_FOR_FIELD'
    );

    if (!isTypeOrmError && !isPrismaError) {
      // Not a database error, re-throw to let other filters handle it
      throw exception;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database query failed';
    let errors: any = null;

    // Handle specific database errors
    const error = exception as any;
    const code = error.code || error.errno || error.meta?.code;

    switch (code) {
      case 'P2002': // Prisma unique constraint violation
      case 'ER_DUP_ENTRY':
      case '23000':
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry detected';
        errors = this.extractDuplicateKeyInfo(error.message || error.meta?.target);
        break;
        
      case 'P2003': // Prisma foreign key constraint violation
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
      case 'P1001': // Prisma connection error
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection failed';
        break;
        
      case 'ER_ACCESS_DENIED_ERROR':
      case 'P1000': // Prisma authentication error
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database access denied';
        break;
        
      default:
        // Log unknown database errors for debugging
        this.logger.error(
          'Unknown database error:',
          JSON.stringify({
            code,
            message: error.message || error.meta?.message,
            sql: error.sql,
            parameters: error.parameters || error.meta?.cause,
          }),
          (error && error.stack) || undefined,
        );
        break;
    }

    // Log the database error (avoid leaking sensitive parameters in production)
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const safeParams = isProd ? this.sanitizeDbParams(error.parameters || error.meta?.cause) : (error.parameters || error.meta?.cause);

    this.logger.error(
      `Database Error: ${code} - ${message}`,
      JSON.stringify({
        path: request.url,
        method: request.method,
        sql: error.sql,
        parameters: safeParams,
        driverError: isProd ? undefined : (error.driverError || error.meta),
        timestamp: new Date().toISOString(),
      }),
      (error && error.stack) || undefined,
    );

    // Create standardized error response
    const errorResponse = ResponseUtil.error(message, 'ERROR', status, errors);

    response.status(status).json(errorResponse);
  }

  private extractDuplicateKeyInfo(messageOrTarget: string | string[]): any {
    // Handle Prisma error (target is array of field names)
    if (Array.isArray(messageOrTarget)) {
      return {
        fields: messageOrTarget,
        message: `Duplicate entry detected for fields: ${messageOrTarget.join(', ')}`,
      };
    }

    // Handle TypeORM/MySQL error message
    const message = messageOrTarget || '';
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
