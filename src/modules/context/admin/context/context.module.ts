import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Context } from '@/shared/entities/context.entity';
import { AdminContextController } from './controllers/context.controller';
import { AdminContextService } from './services/context.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Context]),
    RbacModule,
  ],
  controllers: [AdminContextController],
  providers: [AdminContextService],
  exports: [AdminContextService],
})
export class AdminContextModule {}

