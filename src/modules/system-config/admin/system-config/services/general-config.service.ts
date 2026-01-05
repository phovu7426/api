import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { GeneralConfig } from '@/shared/entities/general-config.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { UpdateGeneralConfigDto } from '../dtos/update-general-config.dto';
import { CacheService } from '@/common/services/cache.service';

@Injectable()
export class GeneralConfigService extends CrudService<GeneralConfig> {
  private readonly CACHE_KEY = 'public:general-config';

  constructor(
    @InjectRepository(GeneralConfig)
    protected readonly generalConfigRepository: Repository<GeneralConfig>,
    private readonly cacheService: CacheService,
  ) {
    super(generalConfigRepository);
  }

  /**
   * Lấy cấu hình chung (chỉ có 1 record duy nhất)
   * Nếu chưa có thì tạo mặc định
   */
  async getConfig(): Promise<GeneralConfig> {
    let config = await this.generalConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    if (!config) {
      // Tạo config mặc định
      const created = await this.create({
        site_name: 'My Website',
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        currency: 'VND',
      } as DeepPartial<GeneralConfig>);
      config = created as GeneralConfig;
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
    const existing = await this.generalConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    let result: GeneralConfig;

    if (!existing) {
      // Tạo mới với giá trị mặc định + dto
      const created = await this.create({
        site_name: dto.site_name || 'My Website',
        site_description: dto.site_description,
        site_logo: dto.site_logo,
        site_favicon: dto.site_favicon,
        site_email: dto.site_email,
        site_phone: dto.site_phone,
        site_address: dto.site_address,
        site_copyright: dto.site_copyright,
        timezone: dto.timezone || 'Asia/Ho_Chi_Minh',
        locale: dto.locale || 'vi',
        currency: dto.currency || 'VND',
      } as DeepPartial<GeneralConfig>, updatedBy);
      result = created as GeneralConfig;
    } else {
      // Update record hiện có
      const updated = await this.update(existing.id, dto as DeepPartial<GeneralConfig>, updatedBy);
      result = updated as GeneralConfig;
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
