import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicContactService } from '@/modules/contact/public/contact/services/contact.service';
import { PublicContactController } from '@/modules/contact/public/contact/controllers/contact.controller';
import { Contact } from '@/shared/entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  controllers: [PublicContactController],
  providers: [PublicContactService],
  exports: [PublicContactService],
})
export class PublicContactModule {}

