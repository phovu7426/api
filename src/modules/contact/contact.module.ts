import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import shared entities
import { Contact } from '@/shared/entities/contact.entity';

// Import admin modules
import { AdminContactModule } from '@/modules/contact/admin/contact/contact.module';

// Import public modules
import { PublicContactModule } from '@/modules/contact/public/contact/contact.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
    ]),
    // Admin modules
    AdminContactModule,
    // Public modules
    PublicContactModule,
  ],
  exports: [
    // Export shared entities for other modules to use
    TypeOrmModule,
  ],
})
export class ContactModule {}

