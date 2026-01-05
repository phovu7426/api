import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Contact } from '@/shared/entities/contact.entity';
import { ContactStatus } from '@/shared/enums/contact-status.enum';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';

@Injectable()
export class ContactService extends CrudService<Contact> {
  constructor(
    @InjectRepository(Contact)
    protected readonly contactRepository: Repository<Contact>,
  ) {
    super(contactRepository);
  }

  /**
   * Gửi phản hồi cho contact
   */
  async replyToContact(id: number, reply: string, repliedBy?: number) {
    return this.update(id, {
      reply,
      status: ContactStatus.Replied,
      replied_at: new Date(),
      replied_by: repliedBy,
    } as DeepPartial<Contact>);
  }

  /**
   * Đánh dấu contact đã đọc
   */
  async markAsRead(id: number) {
    const contact = await this.getOne({ id } as any);
    if (contact && contact.status === ContactStatus.Pending) {
      return this.update(id, { status: ContactStatus.Read } as DeepPartial<Contact>);
    }
    return contact;
  }

  /**
   * Đóng contact
   */
  async closeContact(id: number) {
    return this.update(id, { status: ContactStatus.Closed } as DeepPartial<Contact>);
  }
}

