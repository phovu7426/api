import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UserService } from '@/modules/user-management/user/user/services/user.service';
import { Auth } from '@/common/utils/auth.util';
import { UpdateProfileDto } from '@/modules/user-management/user/user/dto/update-profile.dto';
import { ChangePasswordDto } from '@/modules/user-management/user/user/dto/change-password.dto';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Permission('public')
  @Get('me')
  async me() {
    const userId = Auth.id(undefined) as number | null;
    return this.userService.getByIdSafe(userId!);
  }

  @LogRequest()
  @Patch('me')
  async updateMe(@Body() dto: UpdateProfileDto) {
    const userId = Auth.id(undefined) as number | null;
    return this.userService.updateProfile(userId!, dto);
  }

  @LogRequest()
  @Patch('me/password')
  async changeMyPassword(@Body() dto: ChangePasswordDto) { 
    const userId = Auth.id(undefined) as number | null;
    return this.userService.changePassword(userId!, dto);
  }
}
