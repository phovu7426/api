import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { safeUser } from '@/modules/auth/utils/user.util';
import { UpdateProfileDto } from '@/modules/user-management/user/user/dto/update-profile.dto';
import { ChangePasswordDto } from '@/modules/user-management/user/user/dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByIdSafe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        profile: true,
      },
    });
    if (!user) return null;
    return safeUser({ 
      ...user, 
      id: Number(user.id),
      status: user.status as any,
      created_user_id: user.created_user_id ? Number(user.created_user_id) : null,
      updated_user_id: user.updated_user_id ? Number(user.updated_user_id) : null,
      profile: user.profile ? {
        ...user.profile,
        id: Number(user.profile.id),
        user_id: Number(user.profile.user_id),
        created_user_id: user.profile.created_user_id ? Number(user.profile.created_user_id) : null,
        updated_user_id: user.profile.updated_user_id ? Number(user.profile.updated_user_id) : null,
      } : undefined,
    } as any);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new Error('Không thể cập nhật thông tin user');

    // Unique check phone nếu cung cấp
    if (dto.phone) {
      const exists = await this.prisma.user.findFirst({
        where: { 
          phone: dto.phone, 
          id: { not: BigInt(userId) },
          deleted_at: null,
        },
      });
      if (exists) {
        throw new Error('Số điện thoại đã được sử dụng.');
      }
    }

    // Update user
    const userUpdate: any = {};
    if (dto.phone !== undefined) userUpdate.phone = dto.phone;

    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: BigInt(userId) },
        data: userUpdate,
      });
    }

    // Update or create profile
    const profileUpdate: any = {};
    if (dto.name !== undefined) profileUpdate.name = dto.name;
    if (dto.image !== undefined) profileUpdate.image = dto.image;
    if (dto.birthday !== undefined) profileUpdate.birthday = dto.birthday;
    if (dto.gender !== undefined) profileUpdate.gender = dto.gender;
    if (dto.address !== undefined) profileUpdate.address = dto.address;
    if (dto.about !== undefined) profileUpdate.about = dto.about;

    if (Object.keys(profileUpdate).length > 0) {
      await this.prisma.profile.upsert({
        where: { user_id: BigInt(userId) },
        create: {
          user_id: BigInt(userId),
          ...profileUpdate,
        },
        update: profileUpdate,
      });
    }

    // Get updated user
    const updated = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        profile: true,
      },
    });

    return updated ? safeUser({ 
      ...updated, 
      id: Number(updated.id),
      status: updated.status as any,
      created_user_id: updated.created_user_id ? Number(updated.created_user_id) : null,
      updated_user_id: updated.updated_user_id ? Number(updated.updated_user_id) : null,
      profile: updated.profile ? {
        ...updated.profile,
        id: Number(updated.profile.id),
        user_id: Number(updated.profile.user_id),
        created_user_id: updated.profile.created_user_id ? Number(updated.profile.created_user_id) : null,
        updated_user_id: updated.profile.updated_user_id ? Number(updated.profile.updated_user_id) : null,
      } : undefined,
    } as any) : null;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: BigInt(userId) },
      select: { id: true, password: true },
    });
    if (!user || !user.password) throw new Error('Không thể đổi mật khẩu');

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) throw new Error('Mật khẩu hiện tại không đúng');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { password: hashed },
    });

    return null;
  }
}
