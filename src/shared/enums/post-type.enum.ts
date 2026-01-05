import { PostType as PrismaPostType } from '@prisma/client';

/**
 * Post Type Enum
 * 
 * Định nghĩa các loại bài viết trong hệ thống
 */
// Re-export Prisma enum
export { PostType } from '@prisma/client';

/**
 * Labels cho PostType
 */
export const PostTypeLabels: Record<PrismaPostType, string> = {
  text: 'Văn bản',
  video: 'Video',
  image: 'Hình ảnh',
  audio: 'Âm thanh',
};

/**
 * Các loại bài viết hỗ trợ media (video, image, audio)
 */
export const MEDIA_POST_TYPES: PrismaPostType[] = [
  'video',
  'image',
  'audio',
];

/**
 * Các loại bài viết yêu cầu URL media
 */
export const REQUIRES_MEDIA_URL_POST_TYPES: PrismaPostType[] = [
  'video',
  'audio',
];

