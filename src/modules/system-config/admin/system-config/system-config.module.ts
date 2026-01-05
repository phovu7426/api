import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralConfig } from '@/shared/entities/general-config.entity';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { GeneralConfigController } from './controllers/general-config.controller';
import { EmailConfigController } from './controllers/email-config.controller';
import { GeneralConfigService } from './services/general-config.service';
import { EmailConfigService } from './services/email-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralConfig, EmailConfig]),
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
