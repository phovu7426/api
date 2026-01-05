import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Context } from '@/shared/entities/context.entity';
import { ContextController } from './controllers/context.controller';
import { UserContextService } from './services/context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Context]),
  ],
  controllers: [ContextController],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}

