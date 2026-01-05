import { Module } from '@nestjs/common';
import { RoleService } from '@/modules/user-management/admin/role/services/role.service';
import { RoleController } from '@/modules/user-management/admin/role/controllers/role.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class AdminRoleModule { }




