import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralConfig } from '@/shared/entities/general-config.entity';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { AdminSystemConfigModule } from './admin/system-config/system-config.module';
import { PublicGeneralConfigModule } from './public/general-config/general-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralConfig, EmailConfig]),
    AdminSystemConfigModule,
    PublicGeneralConfigModule,
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class SystemConfigModule {}
