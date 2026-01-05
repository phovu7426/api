/**
 * Post Type Enum
 * 
 * Định nghĩa các loại bài viết trong hệ thống
 */
export enum PostType {
  /** Bài viết dạng text thông thường */
  TEXT = 'text',
  
  /** Bài viết dạng video */
  VIDEO = 'video',
  
  /** Bài viết dạng hình ảnh (gallery) */
  IMAGE = 'image',
  
  /** Bài viết dạng audio */
  AUDIO = 'audio',
}

/**
 * Labels cho PostType
 */
export const PostTypeLabels: Record<PostType, string> = {
  [PostType.TEXT]: 'Văn bản',
  [PostType.VIDEO]: 'Video',
  [PostType.IMAGE]: 'Hình ảnh',
  [PostType.AUDIO]: 'Âm thanh',
};

/**
 * Các loại bài viết hỗ trợ media (video, image, audio)
 */
export const MEDIA_POST_TYPES = [
  PostType.VIDEO,
  PostType.IMAGE,
  PostType.AUDIO,
];

/**
 * Các loại bài viết yêu cầu URL media
 */
export const REQUIRES_MEDIA_URL_POST_TYPES = [
  PostType.VIDEO,
  PostType.AUDIO,
];

