import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Contact } from '@/shared/entities/contact.entity';
import { ContactStatus } from '@/shared/enums/contact-status.enum';
import { CreateContactDto } from '@/modules/contact/public/contact/dtos/create-contact.dto';

@Injectable()
export class PublicContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Tạo contact mới từ public
   */
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      status: ContactStatus.Pending,
    } as DeepPartial<Contact>);
    
    return this.contactRepository.save(contact);
  }
}

