import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { RoleContext } from '@/shared/entities/role-context.entity';
import { RoleService } from '@/modules/user-management/admin/role/services/role.service';
import { RoleController } from '@/modules/user-management/admin/role/controllers/role.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RoleContext]),
    RbacModule,
  ],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class AdminRoleModule { }




