/**
 * Base Module Exports
 */

// Core
// (no core exports right now)

// Services
export { ListService, CrudService } from '@/common/base/services';

// Types
export { Filters, Options, PaginatedListResult } from '@/common/base/interfaces';
// Note: ResponseInterceptor has been removed as it was redundant with TransformInterceptor
// All response transformations are now handled by TransformInterceptor in src/common/interceptors/


