import { Module } from '@nestjs/common';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { Context } from '@/shared/entities/context.entity';
import { RoleContext } from '@/shared/entities/role-context.entity';
import { Group } from '@/shared/entities/group.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { UserRoleAssignment } from '@/shared/entities/user-role-assignment.entity';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RbacController } from '@/modules/rbac/controllers/rbac.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Role, 
    Permission, 
    User, 
    Context, 
    RoleContext,
    Group,
    UserGroup,
    UserRoleAssignment,
  ])],
  providers: [RbacService, RbacCacheService],
  controllers: [RbacController],
  exports: [RbacService, RbacCacheService, TypeOrmModule],
})
export class RbacModule { }


