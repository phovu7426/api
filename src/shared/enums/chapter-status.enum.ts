/**
 * Chapter Status Enum
 *
 * Định nghĩa các trạng thái của chương truyện trong hệ thống.
 */
export enum ChapterStatus {
    /** Chương ở trạng thái nháp */
    DRAFT = 'draft',

    /** Chương đã xuất bản */
    PUBLISHED = 'published',
}

/**
 * Labels cho ChapterStatus
 */
export const ChapterStatusLabels: Record<ChapterStatus, string> = {
    [ChapterStatus.DRAFT]: 'Nháp',
    [ChapterStatus.PUBLISHED]: 'Đã xuất bản',
};

/**
 * Các trạng thái chương có thể hiển thị công khai
 */
export const PUBLIC_CHAPTER_STATUSES = [
    ChapterStatus.PUBLISHED,
];

/**
 * Các trạng thái chương quản trị có thể thao tác
 */
export const MANAGEABLE_CHAPTER_STATUSES = [
    ChapterStatus.DRAFT,
    ChapterStatus.PUBLISHED,
];



