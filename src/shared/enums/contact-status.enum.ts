export enum ContactStatus {
  Pending = 'pending',
  Read = 'read',
  Replied = 'replied',
  Closed = 'closed',
}

export const ContactStatusLabels: Record<ContactStatus, string> = {
  [ContactStatus.Pending]: 'Chờ xử lý',
  [ContactStatus.Read]: 'Đã đọc',
  [ContactStatus.Replied]: 'Đã trả lời',
  [ContactStatus.Closed]: 'Đã đóng',
};

