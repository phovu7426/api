import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get list of notifications
   */
  async getList(filters?: any, options?: any) {
    const where: Prisma.NotificationWhereInput = {
      ...(filters?.user_id && { user_id: BigInt(filters.user_id) }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.is_read !== undefined && { is_read: filters.is_read }),
      deleted_at: null,
    };

    const orderBy: Prisma.NotificationOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: true,
        },
      }),
      this.prisma.notification.count({ where }),
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
   * Get one notification
   */
  async getOne(where: Prisma.NotificationWhereInput) {
    return this.prisma.notification.findFirst({
      where: { ...where, deleted_at: null },
      include: {
        user: true,
      },
    });
  }

  /**
   * Create notification
   */
  async create(data: any, createdBy?: number) {
    // Handle user_id if provided as number
    const notificationData: Prisma.NotificationUncheckedCreateInput = {
      ...data,
      user_id: data.user_id ? BigInt(data.user_id) : undefined,
      created_user_id: createdBy ?? null,
      updated_user_id: createdBy ?? null,
    };
    return this.prisma.notification.create({
      data: notificationData,
    });
  }

  /**
   * Update notification
   */
  async update(id: number | bigint, data: any, updatedBy?: number) {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    const existing = await this.prisma.notification.findUnique({ where: { id: idBigInt } });
    if (!existing) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const updateData: Prisma.NotificationUncheckedUpdateInput = {
      ...data,
      ...(data.user_id && { user_id: BigInt(data.user_id) }),
      updated_user_id: updatedBy ?? existing.updated_user_id,
    };
    return this.prisma.notification.update({
      where: { id: idBigInt },
      data: updateData,
    });
  }

  /**
   * Delete notification (soft delete)
   */
  async delete(id: number | bigint) {
    const idBigInt = typeof id === 'number' ? BigInt(id) : id;
    return this.prisma.notification.update({
      where: { id: idBigInt },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Mark notification as read for user
   */
  async markAsReadForUser(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: BigInt(id),
        user_id: BigInt(userId),
        deleted_at: null,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsReadForUser(userId: number) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: BigInt(userId),
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Get simple list (without relations)
   */
  async getSimpleList(filters?: any, options?: any) {
    const where: Prisma.NotificationWhereInput = {
      ...(filters?.user_id && { user_id: BigInt(filters.user_id) }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.is_read !== undefined && { is_read: filters.is_read }),
      deleted_at: null,
    };

    const orderBy: Prisma.NotificationOrderByWithRelationInput[] = options?.sort 
      ? this.parseSort(options.sort)
      : [{ created_at: 'desc' }];

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
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
   * Restore deleted notification
   */
  async restore(id: number) {
    return this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: { deleted_at: null },
    });
  }

  /**
   * Parse sort string to Prisma orderBy
   */
  private parseSort(sort: string | string[]): Prisma.NotificationOrderByWithRelationInput[] {
    const sorts = Array.isArray(sort) ? sort : [sort];
    return sorts.map(s => {
      const [field, direction] = s.split(':');
      return { [field]: direction?.toLowerCase() === 'desc' ? 'desc' : 'asc' } as Prisma.NotificationOrderByWithRelationInput;
    });
  }
}
