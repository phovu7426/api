import { Module } from '@nestjs/common';
import { UserService } from '@/modules/user-management/user/user/services/user.service';
import { UserController } from '@/modules/user-management/user/user/controllers/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserUserModule { }
