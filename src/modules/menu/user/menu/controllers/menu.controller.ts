import { Controller, Get, Query } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AuthService } from '@/common/services/auth.service';
import { MenuService } from '@/modules/menu/admin/menu/services/menu.service';

@Controller('admin/user/menus')
export class UserMenuController {
  constructor(
    private readonly service: MenuService,
    private readonly auth: AuthService,
  ) {}

  @Permission('public')
  @Get()
  async getUserMenus(
    @Query('include_inactive') includeInactive?: string,
    @Query('flatten') flatten?: string,
  ) {
    const userId = this.auth.id();
    if (!userId) {
      // Return empty array if not authenticated
      return [];
    }

    const options = {
      include_inactive: includeInactive === 'true',
      flatten: flatten === 'true',
    };

    return this.service.getUserMenus(userId, options);
  }
}
