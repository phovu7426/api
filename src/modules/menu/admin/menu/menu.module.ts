import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, MenuPermission } from '@/shared/entities/menu.entity';
import { MenuService } from '@/modules/menu/admin/menu/services/menu.service';
import { AdminMenuController } from '@/modules/menu/admin/menu/controllers/menu.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuPermission]),
    RbacModule,
  ],
  controllers: [AdminMenuController],
  providers: [MenuService],
  exports: [MenuService, TypeOrmModule, RbacModule],
})
export class AdminMenuModule {}

