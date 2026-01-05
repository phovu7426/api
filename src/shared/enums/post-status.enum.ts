/**
 * Post Status Enum
 *
 * Định nghĩa các trạng thái của bài viết trong hệ thống.
 */
export enum PostStatus {
    /** Bài viết ở trạng thái nháp */
    DRAFT = 'draft',

    /** Bài viết đã lên lịch xuất bản */
    SCHEDULED = 'scheduled',

    /** Bài viết đã xuất bản */
    PUBLISHED = 'published',

    /** Bài viết đã được lưu trữ */
    ARCHIVED = 'archived',
}

/**
 * Labels cho PostStatus
 */
export const PostStatusLabels: Record<PostStatus, string> = {
    [PostStatus.DRAFT]: 'Nháp',
    [PostStatus.SCHEDULED]: 'Đã lên lịch',
    [PostStatus.PUBLISHED]: 'Đã xuất bản',
    [PostStatus.ARCHIVED]: 'Lưu trữ',
};

/**
 * Các trạng thái bài viết có thể hiển thị công khai
 */
export const PUBLIC_POST_STATUSES = [
    PostStatus.PUBLISHED,
];

/**
 * Các trạng thái bài viết quản trị có thể thao tác
 */
export const MANAGEABLE_POST_STATUSES = [
    PostStatus.DRAFT,
    PostStatus.SCHEDULED,
    PostStatus.PUBLISHED,
    PostStatus.ARCHIVED,
];






