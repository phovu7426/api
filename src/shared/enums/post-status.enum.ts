import { PostStatus as PrismaPostStatus } from '@prisma/client';

/**
 * Post Status Enum
 *
 * Định nghĩa các trạng thái của bài viết trong hệ thống.
 */
// Re-export Prisma enum
export { PostStatus } from '@prisma/client';

/**
 * Labels cho PostStatus
 */
export const PostStatusLabels: Record<PrismaPostStatus, string> = {
    draft: 'Nháp',
    scheduled: 'Đã lên lịch',
    published: 'Đã xuất bản',
    archived: 'Lưu trữ',
};

/**
 * Các trạng thái bài viết có thể hiển thị công khai
 */
export const PUBLIC_POST_STATUSES: PrismaPostStatus[] = [
    'published',
];

/**
 * Các trạng thái bài viết quản trị có thể thao tác
 */
export const MANAGEABLE_POST_STATUSES: PrismaPostStatus[] = [
    'draft',
    'scheduled',
    'published',
    'archived',
];






