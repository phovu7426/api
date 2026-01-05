import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

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

@Entity('general_configs')
@Index('idx_general_configs_deleted_at', ['deleted_at'])
export class GeneralConfig extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  site_name: string;

  @Column({ type: 'text', nullable: true })
  site_description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  site_logo?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  site_favicon?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  site_email?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  site_phone?: string | null;

  @Column({ type: 'text', nullable: true })
  site_address?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  site_copyright?: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  locale: string;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'json', nullable: true })
  contact_channels?: ContactChannel[] | null;

  // SEO fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string | null;

  @Column({ type: 'text', nullable: true })
  meta_keywords?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  og_title?: string | null;

  @Column({ type: 'text', nullable: true })
  og_description?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  og_image?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonical_url?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  google_analytics_id?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  google_search_console?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  facebook_pixel_id?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  twitter_site?: string | null;
}
