import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/contact-status.enum';
import { CreateContactDto } from '@/modules/contact/public/contact/dtos/create-contact.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublicContactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create contact from public
   */
  async create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        name: createContactDto.name,
        email: createContactDto.email,
        phone: createContactDto.phone ?? null,
        subject: createContactDto.subject ?? null,
        message: createContactDto.message,
        status: ContactStatus.pending,
      },
    });
  }
}
