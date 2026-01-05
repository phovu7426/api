import { UserStatus as PrismaUserStatus } from '@prisma/client';

// Re-export Prisma enum
export { UserStatus } from '@prisma/client';

// Labels for UI display
export const UserStatusLabels: Record<PrismaUserStatus, string> = {
  active: 'Hoạt động',
  pending: 'Chờ xác nhận',
  inactive: 'Đã khóa',
};



