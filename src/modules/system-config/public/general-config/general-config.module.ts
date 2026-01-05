import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralConfig } from '@/shared/entities/general-config.entity';
import { PublicGeneralConfigController } from './controllers/general-config.controller';
import { PublicGeneralConfigService } from './services/general-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralConfig]),
  ],
  controllers: [PublicGeneralConfigController],
  providers: [PublicGeneralConfigService],
  exports: [PublicGeneralConfigService],
})
export class PublicGeneralConfigModule {}
