/**
 * Review Status Enum
 * 
 * Định nghĩa các trạng thái của đánh giá sản phẩm trong hệ thống
 */
export enum ReviewStatus {
    /** Đánh giá chờ duyệt */
    PENDING = 'pending',

    /** Đánh giá đã được duyệt */
    APPROVED = 'approved',

    /** Đánh giá bị từ chối */
    REJECTED = 'rejected',
}

/**
 * Labels cho ReviewStatus
 */
export const ReviewStatusLabels: Record<ReviewStatus, string> = {
    [ReviewStatus.PENDING]: 'Chờ duyệt',
    [ReviewStatus.APPROVED]: 'Đã duyệt',
    [ReviewStatus.REJECTED]: 'Bị từ chối',
};


/**
 * Các trạng thái đánh giá có thể hiển thị công khai
 */
export const PUBLIC_REVIEW_STATUSES = [
    ReviewStatus.APPROVED,
];

/**
 * Các trạng thái đánh giá cần quản trị viên duyệt
 */
export const PENDING_REVIEW_STATUSES = [
    ReviewStatus.PENDING,
];

/**
 * Các trạng thái đánh giá hoàn tất (không thể thay đổi)
 */
export const FINAL_REVIEW_STATUSES = [
    ReviewStatus.APPROVED,
    ReviewStatus.REJECTED,
];