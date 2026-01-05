import {
  Controller,
  Get,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { GeneralConfigService } from '../services/general-config.service';
import { UpdateGeneralConfigDto } from '../dtos/update-general-config.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';

@Controller('admin/system-config/general')
export class GeneralConfigController {
  constructor(
    private readonly generalConfigService: GeneralConfigService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Lấy cấu hình chung
   */
  @Permission('config.manage')
  @Get()
  getConfig() {
    return this.generalConfigService.getConfig();
  }

  /**
   * Cập nhật cấu hình chung
   */
  @Permission('config.manage')
  @LogRequest()
  @Put()
  updateConfig(@Body(ValidationPipe) dto: UpdateGeneralConfigDto) {
    const userId = this.auth.id() || undefined;
    return this.generalConfigService.updateConfig(dto, userId);
  }
}
