import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import shared entities
import { User } from '@/shared/entities/user.entity';
import { Profile } from '@/shared/entities/profile.entity';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';

// Import shared services
import { UserService } from '@/modules/user-management/user/user/services/user.service';

// Import admin modules
import { AdminUserModule } from '@/modules/user-management/admin/user/user.module';
import { AdminRoleModule } from '@/modules/user-management/admin/role/role.module';
import { AdminPermissionModule } from '@/modules/user-management/admin/permission/permission.module';

// Import user modules
import { UserUserModule } from '@/modules/user-management/user/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Role,
      Permission,
    ]),
    // Admin modules
    AdminUserModule,
    AdminRoleModule,
    AdminPermissionModule,
    // User modules
    UserUserModule,
  ],
  providers: [
    // Shared services
    UserService,
  ],
  exports: [
    // Export shared services for other modules to use
    UserService,
    TypeOrmModule,
  ],
})
export class UserManagementModule {}