import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheService } from '@/common/services/cache.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type GeneralConfig = Prisma.GeneralConfigGetPayload<{}>;

@Injectable()
export class PublicGeneralConfigService {
  private readonly CACHE_KEY = 'public:general-config';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Lấy cấu hình chung (có cache)
   * Dùng cho public API
   */
  async getConfig(): Promise<GeneralConfig> {
    return this.cacheService.getOrSet<GeneralConfig>(
      this.CACHE_KEY,
      async () => {
        const prisma = this.prisma as any;
        const config = await prisma.generalConfig.findFirst({
          orderBy: { id: 'asc' },
        });

        if (!config) {
          // Trả về config mặc định nếu chưa có
          return {
            id: BigInt(0),
            site_name: 'My Website',
            site_description: null,
            site_logo: null,
            site_favicon: null,
            site_email: null,
            site_phone: null,
            site_address: null,
            site_copyright: null,
            timezone: 'Asia/Ho_Chi_Minh',
            locale: 'vi',
            currency: 'VND',
            contact_channels: null,
            meta_title: null,
            meta_keywords: null,
            meta_description: null,
            og_title: null,
            og_description: null,
            og_image: null,
            canonical_url: null,
            google_analytics_id: null,
            google_search_console: null,
            facebook_pixel_id: null,
            twitter_site: null,
            created_user_id: null,
            updated_user_id: null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          } as GeneralConfig;
        }

        return config;
      },
      this.CACHE_TTL,
    );
  }

  /**
   * Xóa cache (được gọi khi admin update config)
   */
  async clearCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEY);
  }
}
