import { Gender as PrismaGender } from '@prisma/client';

// Re-export Prisma enum
export { Gender } from '@prisma/client';

// Labels for UI display
export const GenderLabels: Record<PrismaGender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};



