import { Module } from '@nestjs/common';
import { GeneralConfigController } from './controllers/general-config.controller';
import { EmailConfigController } from './controllers/email-config.controller';
import { GeneralConfigService } from './services/general-config.service';
import { EmailConfigService } from './services/email-config.service';

@Module({
  imports: [
  ],
  controllers: [
    GeneralConfigController,
    EmailConfigController,
  ],
  providers: [
    GeneralConfigService,
    EmailConfigService,
  ],
  exports: [
    GeneralConfigService,
    EmailConfigService,
  ],
})
export class AdminSystemConfigModule {}
