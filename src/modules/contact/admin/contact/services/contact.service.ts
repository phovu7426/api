import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/contact-status.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get simple list (without relations)
   */
  async getSimpleList(filters?: any, options?: any) {
    return this.getList(filters, options);
  }

  /**
   * Get list of contacts
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.ContactWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.email && { email: { contains: filters.email } }),
      deleted_at: null,
    };

    const orderBy: Prisma.ContactOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get one contact
   */
  async getOne(where: Prisma.ContactWhereInput) {
    return this.prisma.contact.findFirst({
      where: { ...where, deleted_at: null },
    });
  }

  /**
   * Create contact
   */
  async create(data: Prisma.ContactCreateInput, createdBy?: number) {
    return this.prisma.contact.create({
      data: {
        ...data,
        created_user_id: createdBy ?? null,
        updated_user_id: createdBy ?? null,
      },
    });
  }

  /**
   * Update contact
   */
  async update(id: number | bigint, data: Prisma.ContactUpdateInput, updatedBy?: number) {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const existing = await this.prisma.contact.findUnique({ where: { id: idBigInt } });
    if (!existing) {
      throw new Error(`Contact with ID ${id} not found`);
    }

    return this.prisma.contact.update({
      where: { id: idBigInt },
      data: {
        ...data,
        updated_user_id: updatedBy ?? existing.updated_user_id,
      },
    });
  }

  /**
   * Delete contact (soft delete)
   */
  async delete(id: number | bigint) {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    return this.prisma.contact.update({
      where: { id: idBigInt },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Reply to contact
   */
  async replyToContact(id: number, reply: string, repliedBy?: number) {
    return this.update(BigInt(id), {
      reply,
      status: ContactStatus.replied,
      replied_at: new Date(),
      replied_by: repliedBy ?? null,
    });
  }

  /**
   * Mark as read
   */
  async markAsRead(id: number) {
    const contact = await this.getOne({ id: BigInt(id) });
    if (contact && contact.status === ContactStatus.pending) {
      return this.update(BigInt(id), { status: ContactStatus.read });
    }
    return contact;
  }

  /**
   * Close contact
   */
  async closeContact(id: number) {
    return this.update(BigInt(id), { status: ContactStatus.closed });
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.ContactOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.ContactOrderByWithRelationInput;
    });
  }
}
