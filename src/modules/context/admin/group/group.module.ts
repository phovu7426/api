import { Module } from '@nestjs/common';
import { AdminGroupController } from './controllers/group.controller';
import { AdminGroupService } from './services/group.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [AdminGroupController],
  providers: [AdminGroupService],
  exports: [AdminGroupService],
})
export class AdminGroupModule {}

