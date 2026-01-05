import { Module } from '@nestjs/common';
import { UserService } from '@/modules/user-management/admin/user/services/user.service';
import { UserController } from '@/modules/user-management/admin/user/controllers/user.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class AdminUserModule { }


