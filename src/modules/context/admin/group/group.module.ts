import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '@/shared/entities/group.entity';
import { Context } from '@/shared/entities/context.entity';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { AdminGroupController } from './controllers/group.controller';
import { AdminGroupService } from './services/group.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Context, User, Role]),
    RbacModule,
  ],
  controllers: [AdminGroupController],
  providers: [AdminGroupService],
  exports: [AdminGroupService],
})
export class AdminGroupModule {}

