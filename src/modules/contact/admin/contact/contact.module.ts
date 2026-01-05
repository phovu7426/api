import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from '@/modules/contact/admin/contact/services/contact.service';
import { ContactController } from '@/modules/contact/admin/contact/controllers/contact.controller';
import { Contact } from '@/shared/entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class AdminContactModule {}

