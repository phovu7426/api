import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Business Exception - For business logic errors
 * These should be caught and converted to proper HTTP responses
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode?: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        success: false,
        message,
        errorCode: errorCode || 'BUSINESS_ERROR',
        httpStatus: statusCode,
      },
      statusCode
    );
  }
}

/**
 * Resource Not Found Exception
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier 
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;
    super(message, 'RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

/**
 * Insufficient Stock Exception
 */
export class InsufficientStockException extends BusinessException {
  constructor(productName: string, available: number, requested: number) {
    super(
      `Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`,
      'INSUFFICIENT_STOCK',
      HttpStatus.BAD_REQUEST
    );
  }
}

/**
 * Invalid Operation Exception
 */
export class InvalidOperationException extends BusinessException {
  constructor(message: string) {
    super(message, 'INVALID_OPERATION', HttpStatus.BAD_REQUEST);
  }
}

/**
 * Duplicate Resource Exception
 */
export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      'DUPLICATE_RESOURCE',
      HttpStatus.CONFLICT
    );
  }
}

/**
 * Validation Exception
 */
export class ValidationException extends BusinessException {
  constructor(message: string, errors?: any) {
    super(
      message,
      'VALIDATION_ERROR',
      HttpStatus.UNPROCESSABLE_ENTITY
    );
    if (errors) {
      (this.getResponse() as any).errors = errors;
    }
  }
}

/**
 * Unauthorized Access Exception
 */
export class UnauthorizedAccessException extends BusinessException {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'UNAUTHORIZED_ACCESS', HttpStatus.FORBIDDEN);
  }
}

/**
 * Payment Required Exception
 */
export class PaymentRequiredException extends BusinessException {
  constructor(message: string = 'Payment is required to complete this action') {
    super(message, 'PAYMENT_REQUIRED', HttpStatus.PAYMENT_REQUIRED);
  }
}

/**
 * Service Unavailable Exception
 */
export class ServiceUnavailableException extends BusinessException {
  constructor(service: string, reason?: string) {
    const message = reason 
      ? `${service} is currently unavailable: ${reason}`
      : `${service} is currently unavailable`;
    super(message, 'SERVICE_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
  }
}