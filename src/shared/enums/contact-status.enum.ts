import { ContactStatus as PrismaContactStatus } from '@prisma/client';

// Re-export Prisma enum
export { ContactStatus } from '@prisma/client';

// Labels for UI display
export const ContactStatusLabels: Record<PrismaContactStatus, string> = {
  pending: 'Chờ xử lý',
  read: 'Đã đọc',
  replied: 'Đã trả lời',
  closed: 'Đã đóng',
};

