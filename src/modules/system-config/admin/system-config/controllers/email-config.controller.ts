import {
  Controller,
  Get,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { EmailConfigService } from '../services/email-config.service';
import { UpdateEmailConfigDto } from '../dtos/update-email-config.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';

@Controller('admin/system-config/email')
export class EmailConfigController {
  constructor(
    private readonly emailConfigService: EmailConfigService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Lấy cấu hình email
   */
  @Permission('config.manage')
  @Get()
  getConfig() {
    return this.emailConfigService.getConfig();
  }

  /**
   * Cập nhật cấu hình email
   */
  @Permission('config.manage')
  @LogRequest()
  @Put()
  updateConfig(@Body(ValidationPipe) dto: UpdateEmailConfigDto) {
    const userId = this.auth.id() || undefined;
    return this.emailConfigService.updateConfig(dto, userId);
  }
}
