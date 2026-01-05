import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class SeedGeneralConfigs {
  private readonly logger = new Logger(SeedGeneralConfigs.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding general configs...');

    // Check if general config already exist
    const existing = await this.prisma.generalConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (existing) {
      this.logger.log('General config already exists. Skipping seeding.');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await this.prisma.user.findFirst({
      where: { username: 'admin', deleted_at: null },
    });
    const defaultUserId = adminUser ? Number(adminUser.id) : 1;

    // Sample contact channels data
    const contactChannels: any[] = [
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

    await this.prisma.generalConfig.create({
      data: {
        site_name: 'My Website',
        site_description: 'Website mô tả',
        site_logo: '/uploads/logo.png',
        site_favicon: '/uploads/favicon.ico',
        site_email: 'contact@example.com',
        site_phone: '19001234',
        site_address: '123 Đường ABC, Quận XYZ, TP.HCM',
        site_copyright: '© 2024 My Website. All rights reserved.',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        currency: 'VND',
        contact_channels: contactChannels as any,
        created_user_id: defaultUserId ? BigInt(defaultUserId) : null,
        updated_user_id: defaultUserId ? BigInt(defaultUserId) : null,
      },
    });

    this.logger.log('General config seeding completed.');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing general configs...');
    await this.prisma.generalConfig.deleteMany({});
    this.logger.log('General configs cleared');
  }
}
