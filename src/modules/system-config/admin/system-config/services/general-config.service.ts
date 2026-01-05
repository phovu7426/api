import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateGeneralConfigDto } from '../dtos/update-general-config.dto';
import { CacheService } from '@/common/services/cache.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type GeneralConfig = Prisma.GeneralConfigGetPayload<{}>;

@Injectable()
export class GeneralConfigService {
  private readonly CACHE_KEY = 'public:general-config';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Lấy cấu hình chung (chỉ có 1 record duy nhất)
   * Nếu chưa có thì tạo mặc định
   */
  async getConfig(): Promise<GeneralConfig> {
    const prisma = this.prisma as any;
    let config = await prisma.generalConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!config) {
      // Tạo config mặc định
      config = await prisma.generalConfig.create({
        data: {
          site_name: 'My Website',
          timezone: 'Asia/Ho_Chi_Minh',
          locale: 'vi',
          currency: 'VND',
        },
      });
    }

    if (!config) {
      throw new Error('Failed to get or create general config');
    }

    return config;
  }

  /**
   * Cập nhật cấu hình chung
   * Nếu chưa có thì tạo mới, nếu có thì update
   */
  async updateConfig(dto: UpdateGeneralConfigDto, updatedBy?: number): Promise<GeneralConfig> {
    const prisma = this.prisma as any;
    const existing = await prisma.generalConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    let result: GeneralConfig;

    if (!existing) {
      // Tạo mới với giá trị mặc định + dto
      result = await prisma.generalConfig.create({
        data: {
          site_name: dto.site_name || 'My Website',
          site_description: dto.site_description ?? null,
          site_logo: dto.site_logo ?? null,
          site_favicon: dto.site_favicon ?? null,
          site_email: dto.site_email ?? null,
          site_phone: dto.site_phone ?? null,
          site_address: dto.site_address ?? null,
          site_copyright: dto.site_copyright ?? null,
          timezone: dto.timezone || 'Asia/Ho_Chi_Minh',
          locale: dto.locale || 'vi',
          currency: dto.currency || 'VND',
          created_user_id: updatedBy ?? null,
          updated_user_id: updatedBy ?? null,
        },
      });
    } else {
      // Update record hiện có
      result = await prisma.generalConfig.update({
        where: { id: existing.id },
        data: {
          site_name: dto.site_name ?? existing.site_name,
          site_description: dto.site_description ?? existing.site_description,
          site_logo: dto.site_logo ?? existing.site_logo,
          site_favicon: dto.site_favicon ?? existing.site_favicon,
          site_email: dto.site_email ?? existing.site_email,
          site_phone: dto.site_phone ?? existing.site_phone,
          site_address: dto.site_address ?? existing.site_address,
          site_copyright: dto.site_copyright ?? existing.site_copyright,
          timezone: dto.timezone ?? existing.timezone,
          locale: dto.locale ?? existing.locale,
          currency: dto.currency ?? existing.currency,
          updated_user_id: updatedBy ?? existing.updated_user_id,
        },
      });
    }

    if (!result) {
      throw new Error('Failed to create or update general config');
    }

    // Invalidate cache sau khi update
    if (this.cacheService && typeof this.cacheService.del === 'function') {
      await this.cacheService.del(this.CACHE_KEY);
    }

    return result;
  }
}
