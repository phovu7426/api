import { MenuType as PrismaMenuType } from '@prisma/client';

/**
 * Menu Type Enum
 * 
 * Định nghĩa các loại menu trong hệ thống
 */
// Re-export Prisma enum
export { MenuType } from '@prisma/client';

/**
 * Labels cho MenuType
 */
export const MenuTypeLabels: Record<PrismaMenuType, string> = {
  route: 'Route',
  group: 'Group',
  link: 'Link',
};

