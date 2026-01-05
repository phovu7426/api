import { Module } from '@nestjs/common';
import { ContextController } from './controllers/context.controller';
import { UserContextService } from './services/context.service';

@Module({
  imports: [],
  controllers: [ContextController],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}

