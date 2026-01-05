/**
 * Comic Status Enum
 *
 * Định nghĩa các trạng thái của truyện tranh trong hệ thống.
 */
export enum ComicStatus {
    /** Truyện ở trạng thái nháp */
    DRAFT = 'draft',

    /** Truyện đã xuất bản */
    PUBLISHED = 'published',

    /** Truyện đã hoàn thành */
    COMPLETED = 'completed',

    /** Truyện bị ẩn khỏi public */
    HIDDEN = 'hidden',
}

/**
 * Labels cho ComicStatus
 */
export const ComicStatusLabels: Record<ComicStatus, string> = {
    [ComicStatus.DRAFT]: 'Nháp',
    [ComicStatus.PUBLISHED]: 'Đã xuất bản',
    [ComicStatus.COMPLETED]: 'Hoàn thành',
    [ComicStatus.HIDDEN]: 'Ẩn',
};

/**
 * Các trạng thái truyện có thể hiển thị công khai
 */
export const PUBLIC_COMIC_STATUSES = [
    ComicStatus.PUBLISHED,
    ComicStatus.COMPLETED,
];

/**
 * Các trạng thái truyện quản trị có thể thao tác
 */
export const MANAGEABLE_COMIC_STATUSES = [
    ComicStatus.DRAFT,
    ComicStatus.PUBLISHED,
    ComicStatus.COMPLETED,
    ComicStatus.HIDDEN,
];



