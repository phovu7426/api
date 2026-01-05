import { BasicStatus as PrismaBasicStatus } from '@prisma/client';

// Re-export Prisma enum
export { BasicStatus } from '@prisma/client';

// Labels for UI display
export const BasicStatusLabels: Record<PrismaBasicStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngừng hoạt động',
};



