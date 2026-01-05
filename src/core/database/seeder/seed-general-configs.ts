import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GeneralConfig, ContactChannel } from '@/shared/entities/general-config.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedGeneralConfigs {
  private readonly logger = new Logger(SeedGeneralConfigs.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding general configs...');

    const generalConfigRepository = this.dataSource.getRepository(GeneralConfig);
    const userRepo = this.dataSource.getRepository(User);

    // Check if general config already exist
    const existing = await generalConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    if (existing) {
      this.logger.log('General config already exists. Skipping seeding.');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Sample contact channels data - Thiên về mua bán sản phẩm
    const contactChannels: ContactChannel[] = [
      {
        type: 'hotline',
        value: '19001234',
        label: 'Hotline Tư Vấn',
        icon: '/icons/phone.png',
        url_template: 'tel:{value}',
        enabled: true,
        sort_order: 1,
      },
      {
        type: 'zalo',
        value: '0123456789',
        label: 'Chat Zalo',
        icon: '/icons/zalo.png',
        url_template: 'https://zalo.me/{value}',
        enabled: true,
        sort_order: 2,
      },
      {
        type: 'messenger',
        value: 'your-page-id',
        label: 'Facebook Messenger',
        icon: '/icons/messenger.png',
        url_template: 'https://m.me/{value}',
        enabled: true,
        sort_order: 3,
      },
      {
        type: 'whatsapp',
        value: '84123456789',
        label: 'WhatsApp',
        icon: '/icons/whatsapp.png',
        url_template: 'https://wa.me/{value}',
        enabled: false,
        sort_order: 4,
      },
      {
        type: 'telegram',
        value: '@yourusername',
        label: 'Telegram',
        icon: '/icons/telegram.png',
        url_template: 'https://t.me/{value}',
        enabled: false,
        sort_order: 5,
      },
    ];

    const generalConfig = generalConfigRepository.create({
      site_name: 'Shop Online - Mua Sắm Trực Tuyến',
      site_description: 'Shop Online - Cửa hàng mua sắm trực tuyến uy tín, đa dạng sản phẩm, giá tốt, giao hàng nhanh. Mua sắm online tiện lợi, an toàn, thanh toán đơn giản.',
      site_logo: null,
      site_favicon: null,
      site_email: 'contact@shoponline.com',
      site_phone: '19001234',
      site_address: '123 Đường ABC, Quận XYZ, TP.HCM',
      site_copyright: '© 2024 Shop Online. All rights reserved.',
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      currency: 'VND',
      contact_channels: contactChannels,
      // SEO fields - Thiên về mua bán sản phẩm
      meta_title: 'Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh',
      meta_keywords: 'mua sắm online, shop online, bán hàng trực tuyến, thương mại điện tử, mua hàng online, sản phẩm giá rẻ, giao hàng nhanh, thanh toán online, cửa hàng online, mua hàng online uy tín',
      og_title: 'Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh',
      og_description: 'Shop Online - Cửa hàng mua sắm trực tuyến uy tín với hàng ngàn sản phẩm đa dạng. Giá tốt, giao hàng nhanh, thanh toán an toàn. Mua sắm online tiện lợi ngay hôm nay!',
      og_image: null, // Sẽ được cập nhật sau khi có logo/ảnh đại diện
      canonical_url: 'https://shoponline.com',
      // Tracking & Analytics - Cần cập nhật với ID thực tế
      google_analytics_id: null, // Ví dụ: 'G-XXXXXXXXXX' - Cần cập nhật với GA4 ID thực tế
      google_search_console: null, // Ví dụ: 'abc123xyz...' - Cần cập nhật với verification code thực tế
      facebook_pixel_id: null, // Ví dụ: '1234567890123456' - Cần cập nhật với Facebook Pixel ID thực tế
      twitter_site: null, // Ví dụ: 'shoponline' (không có @) - Cần cập nhật với Twitter handle thực tế
      created_user_id: defaultUserId,
      updated_user_id: defaultUserId,
    });

    await generalConfigRepository.save(generalConfig);
    this.logger.log('General config seeding completed.');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing general configs...');
    await this.dataSource.getRepository(GeneralConfig).clear();
  }
}
