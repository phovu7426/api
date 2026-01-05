import { Module } from '@nestjs/common';
import { EnumController } from './controllers/enum.controller';
import { EnumService } from './services/enum.service';

@Module({
  controllers: [EnumController],
  providers: [EnumService],
  exports: [EnumService],
})
export class EnumModule {}