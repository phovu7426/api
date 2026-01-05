import { Controller, Get } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { UserGroupService } from '../services/group.service';

/**
 * Controller cho user quản lý groups của chính họ
 * Route: /api/user/groups
 */
@Controller('user/groups')
export class UserGroupController {
  constructor(
    private readonly groupService: UserGroupService,
    private readonly auth: AuthService,
  ) {}

  /**
   * ✅ MỚI: Lấy danh sách groups mà user hiện tại là member, kèm roles trong mỗi group
   * Route: GET /api/user/groups
   */
  @Permission('public')
  @Get()
  async getMyGroups() {
    const userId = this.auth.id();
    if (!userId) {
      return [];
    }

    const groups = await this.groupService.getUserGroups(userId);
    return groups;
  }
}


