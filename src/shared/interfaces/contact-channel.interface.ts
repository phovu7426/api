/**
 * Interface cho Contact Channel (kênh liên hệ)
 */
export interface ContactChannel {
  type: string;              // Loại: 'zalo', 'messenger', 'hotline', 'telegram', 'whatsapp', etc.
  value: string;             // ID, số điện thoại, username...
  label?: string;            // Tên hiển thị (optional)
  icon?: string;             // URL icon/ảnh (optional)
  url_template?: string;     // Template URL (optional): 'https://zalo.me/{value}', 'tel:{value}', etc.
  enabled: boolean;          // Bật/tắt hiển thị
  sort_order?: number;       // Thứ tự hiển thị
}

