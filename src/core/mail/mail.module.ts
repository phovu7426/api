import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfig } from '@/shared/entities/email-config.entity';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailConfig])],
  providers: [MailService],
  exports: [MailService],
})
export class AppMailModule {}

