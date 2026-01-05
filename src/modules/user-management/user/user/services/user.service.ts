import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/shared/entities/user.entity';
import { Profile } from '@/shared/entities/profile.entity';
import { safeUser } from '@/modules/auth/utils/user.util';
import { UpdateProfileDto } from '@/modules/user-management/user/user/dto/update-profile.dto';
import { ChangePasswordDto } from '@/modules/user-management/user/user/dto/change-password.dto';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    @InjectRepository(User) protected readonly userRepository: Repository<User>,
    @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
  ) {
    super(userRepository);
  }

  async getByIdSafe(userId: number) {
    const user = await this.getOne(
      { id: userId },
      { relations: ['profile'] }
    );
    if (!user) return null;
    return safeUser(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('Không thể cập nhật thông tin user');

    // Unique check phone nếu cung cấp
    if (dto.phone) {
      const exists = await this.userRepository.findOne({ where: { phone: dto.phone } });
      if (exists && exists.id !== userId) {
        throw new Error('Số điện thoại đã được sử dụng.');
      }
    }

    // Cập nhật thông tin trong bảng User
    const userPatch: Partial<User> = {};
    if (dto.phone !== undefined) userPatch.phone = dto.phone;

    if (Object.keys(userPatch).length > 0) {
      await this.userRepository.update({ id: userId }, userPatch);
    }

    // Lấy hoặc tạo profile cho user
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = new Profile();
      profile.userId = userId;
      await this.profileRepository.save(profile);
    }

    // Cập nhật thông tin trong bảng Profile
    const profilePatch: Partial<Profile> = {};
    if (dto.name !== undefined) profilePatch.name = dto.name;
    if (dto.image !== undefined) profilePatch.image = dto.image;
    if (dto.birthday !== undefined) profilePatch.birthday = dto.birthday;
    if (dto.gender !== undefined) profilePatch.gender = dto.gender;
    if (dto.address !== undefined) profilePatch.address = dto.address;
    if (dto.about !== undefined) profilePatch.about = dto.about;

    if (Object.keys(profilePatch).length > 0) {
      await this.profileRepository.update({ userId }, profilePatch);
    }

    // Lấy lại thông tin user đã cập nhật
    const updated = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    return updated ? safeUser(updated) : null;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: { id: true, password: true } });
    if (!user || !user.password) throw new Error('Không thể đổi mật khẩu');

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) throw new Error('Mật khẩu hiện tại không đúng');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update({ id: userId }, { password: hashed });

    return null;
  }

}
