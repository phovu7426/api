import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '@/shared/entities/group.entity';
import { Context } from '@/shared/entities/context.entity';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { UserGroup } from '@/shared/entities/user-group.entity';
import { UserRoleAssignment } from '@/shared/entities/user-role-assignment.entity';
import { UserGroupController } from './controllers/group.controller';
import { GroupMemberController } from './controllers/group-member.controller';
import { UserGroupService } from './services/group.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Context, User, Role, UserGroup, UserRoleAssignment]),
    RbacModule,
  ],
  controllers: [UserGroupController, GroupMemberController],
  providers: [UserGroupService],
  exports: [UserGroupService],
})
export class UserGroupModule {}

