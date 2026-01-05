import { NotificationType as PrismaNotificationType } from '@prisma/client';

// Re-export Prisma enum
export { NotificationType } from '@prisma/client';

// Labels for UI display
export const NotificationTypeLabels: Record<PrismaNotificationType, string> = {
  info: 'Thông tin',
  success: 'Thành công',
  warning: 'Cảnh báo',
  error: 'Lỗi',
  order_status: 'Trạng thái đơn hàng',
  payment_status: 'Trạng thái thanh toán',
  promotion: 'Khuyến mãi',
};

