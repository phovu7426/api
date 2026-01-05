import { Module } from '@nestjs/common';
import { PublicContactService } from '@/modules/contact/public/contact/services/contact.service';
import { PublicContactController } from '@/modules/contact/public/contact/controllers/contact.controller';

@Module({
  imports: [],
  controllers: [PublicContactController],
  providers: [PublicContactService],
  exports: [PublicContactService],
})
export class PublicContactModule {}

