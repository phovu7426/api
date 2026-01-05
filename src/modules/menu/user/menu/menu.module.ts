import { Module } from '@nestjs/common';
import { UserMenuController } from '@/modules/menu/user/menu/controllers/menu.controller';
import { AdminMenuModule } from '@/modules/menu/admin/menu/menu.module';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    AdminMenuModule,
  ],
  controllers: [UserMenuController],
})
export class UserMenuModule {}
