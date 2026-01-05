import { Module } from '@nestjs/common';
import { AdminMenuModule } from '@/modules/menu/admin/menu/menu.module';
import { UserMenuModule } from '@/modules/menu/user/menu/menu.module';

@Module({
  imports: [
    AdminMenuModule,
    UserMenuModule,
  ],
  exports: [],
})
export class MenuModule {}

