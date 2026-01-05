import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Context } from '@/shared/entities/context.entity';
import { Group } from '@/shared/entities/group.entity';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

// Import admin modules
import { AdminContextModule } from '@/modules/context/admin/context/context.module';
import { AdminGroupModule } from '@/modules/context/admin/group/group.module';

// Import user modules
import { UserContextModule } from '@/modules/context/user/context/context.module';
import { UserGroupModule } from '@/modules/context/user/group/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Context, Group, User, Role]),
    RbacModule,
    // Admin modules
    AdminContextModule,
    AdminGroupModule,
    // User modules
    UserContextModule,
    UserGroupModule,
  ],
  exports: [TypeOrmModule, AdminContextModule, AdminGroupModule, UserContextModule, UserGroupModule],
})
export class ContextModule {}

