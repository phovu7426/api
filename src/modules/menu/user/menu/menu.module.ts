import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMenuController } from '@/modules/menu/user/menu/controllers/menu.controller';
import { AdminMenuModule } from '@/modules/menu/admin/menu/menu.module';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { Menu, MenuPermission } from '@/shared/entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuPermission]),
    RbacModule,
    AdminMenuModule,
  ],
  controllers: [UserMenuController],
})
export class UserMenuModule {}
