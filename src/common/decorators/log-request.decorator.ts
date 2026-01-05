import { SetMetadata } from '@nestjs/common';

export const LOG_REQUEST_KEY = 'log_request';

export interface LogRequestOptions {
  /** Tên file log (sẽ tự động thêm vào thư mục theo ngày: logs/YYYY-MM-DD/<fileBaseName>.log). Mặc định: 'api-requests' */
  fileBaseName?: string;
  /** Đường dẫn file log tuyệt đối (nếu không dùng fileBaseName) */
  filePath?: string;
}

/**
 * Decorator để đánh dấu API cần lưu log
 * 
 * Mặc định tất cả API không lưu log để tiết kiệm bộ nhớ.
 * Chỉ những API được đánh dấu bằng @LogRequest() mới được lưu log.
 * File log sẽ tự động được tổ chức theo ngày: logs/YYYY-MM-DD/
 * 
 * @example
 * ```typescript
 * // Có thể dùng không tham số (sẽ dùng fileBaseName mặc định: 'api-requests')
 * @LogRequest()
 * @Post()
 * async create(@Body() dto: CreateDto) {
 *   // Log sẽ được lưu vào: logs/2025-12-15/api-requests.log
 *   return this.service.create(dto);
 * }
 * 
 * // Hoặc truyền fileBaseName tùy chỉnh
 * @LogRequest({ fileBaseName: 'post_create' })
 * @Post()
 * async create(@Body() dto: CreateDto) {
 *   // Log sẽ được lưu vào: logs/2025-12-15/post_create.log
 *   return this.service.create(dto);
 * }
 * 
 * @LogRequest({ fileBaseName: 'post_update' })
 * @Put(':id')
 * async update(@Param('id') id: number, @Body() dto: UpdateDto) {
 *   // Log sẽ được lưu vào: logs/2025-12-15/post_update.log
 *   return this.service.update(id, dto);
 * }
 * 
 * // Hoặc dùng đường dẫn tuyệt đối
 * @LogRequest({ filePath: '/var/log/myapp/custom.log' })
 * @Post('special')
 * async special(@Body() dto: any) {
 *   return this.service.special(dto);
 * }
 * ```
 */
export const LogRequest = (options?: LogRequestOptions) => 
  SetMetadata(LOG_REQUEST_KEY, options || { fileBaseName: 'api-requests' });

