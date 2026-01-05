import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@/shared/entities/permission.entity';
import { PermissionService } from '@/modules/user-management/admin/permission/services/permission.service';
import { PermissionController } from '@/modules/user-management/admin/permission/controllers/permission.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    RbacModule,
  ],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class AdminPermissionModule { }




