import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralConfig } from '@/shared/entities/general-config.entity';
import { CacheService } from '@/common/services/cache.service';

@Injectable()
export class PublicGeneralConfigService {
  private readonly CACHE_KEY = 'public:general-config';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectRepository(GeneralConfig)
    private readonly generalConfigRepository: Repository<GeneralConfig>,
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
        const config = await this.generalConfigRepository.findOne({
          where: {} as any,
          order: { id: 'ASC' },
        });

        if (!config) {
          // Trả về config mặc định nếu chưa có
          return {
            id: 0,
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
