import { HttpStatus } from '@nestjs/common';
import { ApiResponse, ResponseUtil } from '@/common/utils/response.util';

/**
 * Interface cho responseRef - có thể chứa ApiResponse hoặc các tham số để tạo response
 */
export interface ResponseRef<T> {
  value?: ApiResponse<T>;
  message?: string;
  code?: string;
  httpStatus?: number;
  errors?: any;
}

/**
 * Helper để xử lý response từ responseRef
 * Ưu tiên dùng response.value nếu có, nếu không thì tạo từ các tham số
 */
export function handleResponseRef<T>(
  responseRef: ResponseRef<T>,
  defaultMessage = 'Điều kiện tiền xử lý không đạt',
  defaultCode = 'PRECONDITION_FAILED'
): ApiResponse<T> {
  if (responseRef.value) {
    return responseRef.value;
  }
  return ResponseUtil.error(
    responseRef.message || defaultMessage,
    responseRef.code || defaultCode,
    responseRef.httpStatus || HttpStatus.BAD_REQUEST,
    responseRef.errors
  ) as ApiResponse<T>;
}

