import { Module } from '@nestjs/common';
import { AdminSystemConfigModule } from './admin/system-config/system-config.module';
import { PublicGeneralConfigModule } from './public/general-config/general-config.module';

@Module({
  imports: [
    AdminSystemConfigModule,
    PublicGeneralConfigModule,
  ],
  exports: [
    AdminSystemConfigModule,
    PublicGeneralConfigModule,
  ],
})
export class SystemConfigModule {}
