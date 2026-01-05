import { Module } from '@nestjs/common';
import { RbacModule } from '@/modules/rbac/rbac.module';

// Import admin modules
import { AdminContextModule } from '@/modules/context/admin/context/context.module';
import { AdminGroupModule } from '@/modules/context/admin/group/group.module';

// Import user modules
import { UserContextModule } from '@/modules/context/user/context/context.module';
import { UserGroupModule } from '@/modules/context/user/group/group.module';

@Module({
  imports: [
    RbacModule,
    // Admin modules
    AdminContextModule,
    AdminGroupModule,
    // User modules
    UserContextModule,
    UserGroupModule,
  ],
  exports: [AdminContextModule, AdminGroupModule, UserContextModule, UserGroupModule],
})
export class ContextModule {}

