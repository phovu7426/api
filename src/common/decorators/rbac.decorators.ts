import { SetMetadata } from '@nestjs/common';

export const PERMS_REQUIRED_KEY = 'perms_required';

// Permission constant để đánh dấu route public
export const PUBLIC_PERMISSION = 'public';

/**
 * Decorator đơn giản để kiểm tra permission
 * 
 * - Không có @Permission() → mặc định là public (không cần authentication)
 * - Có @Permission('post.create') → cần permission 'post.create'
 * - Có @Permission('public') → public route (không cần authentication)
 */
export const Permission = (...permissions: string[]) => SetMetadata(PERMS_REQUIRED_KEY, permissions);




