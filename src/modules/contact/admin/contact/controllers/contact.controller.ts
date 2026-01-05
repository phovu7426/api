import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ContactService } from '@/modules/contact/admin/contact/services/contact.service';
import { CreateContactDto } from '@/modules/contact/admin/contact/dtos/create-contact.dto';
import { UpdateContactDto } from '@/modules/contact/admin/contact/dtos/update-contact.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';

@Controller('admin/contacts')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly auth: AuthService,
  ) {}

  @Permission('contact.manage')
  @LogRequest()
  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Permission('contact.manage')
  @Get()
  findAll(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.contactService.getList(filters, options);
  }

  @Permission('contact.manage')
  @Get('simple')
  getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.contactService.getSimpleList(filters, options);
  }

  @Permission('contact.manage')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.getOne({ id: +id } as any);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.delete(+id);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/reply')
  reply(
    @Param('id') id: string,
    @Body('reply') reply: string,
  ) {
    return this.contactService.replyToContact(+id, reply, this.auth.id() || undefined);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(+id);
  }

  @Permission('contact.manage')
  @LogRequest()
  @Put(':id/close')
  close(@Param('id') id: string) {
    return this.contactService.closeContact(+id);
  }
}

