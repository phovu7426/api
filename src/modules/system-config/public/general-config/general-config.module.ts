import { Module } from '@nestjs/common';
import { PublicGeneralConfigController } from './controllers/general-config.controller';
import { PublicGeneralConfigService } from './services/general-config.service';

@Module({
  imports: [
  ],
  controllers: [PublicGeneralConfigController],
  providers: [PublicGeneralConfigService],
  exports: [PublicGeneralConfigService],
})
export class PublicGeneralConfigModule {}
