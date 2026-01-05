import { Module } from '@nestjs/common';
import { UserGroupController } from './controllers/group.controller';
import { GroupMemberController } from './controllers/group-member.controller';
import { UserGroupService } from './services/group.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [UserGroupController, GroupMemberController],
  providers: [UserGroupService],
  exports: [UserGroupService],
})
export class UserGroupModule {}

