import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuPermission } from '@/shared/entities/menu.entity';
import { AdminMenuModule } from '@/modules/menu/admin/menu/menu.module';
import { UserMenuModule } from '@/modules/menu/user/menu/menu.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuPermission]),
    AdminMenuModule,
    UserMenuModule,
  ],
  exports: [TypeOrmModule],
})
export class MenuModule {}

