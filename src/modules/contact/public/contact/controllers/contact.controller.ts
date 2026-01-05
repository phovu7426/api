import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { PublicContactService } from '@/modules/contact/public/contact/services/contact.service';
import { CreateContactDto } from '@/modules/contact/public/contact/dtos/create-contact.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('public/contacts')
export class PublicContactController {
  constructor(private readonly contactService: PublicContactService) {}

  @Permission('public')
  @LogRequest()
  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
}

