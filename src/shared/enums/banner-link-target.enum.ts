import { BannerLinkTarget as PrismaBannerLinkTarget } from '@prisma/client';

// Re-export Prisma enum
export { BannerLinkTarget } from '@prisma/client';

// Labels for UI display
export const BannerLinkTargetLabels: Record<PrismaBannerLinkTarget, string> = {
  self: 'Cùng tab',
  blank: 'Tab mới',
};

