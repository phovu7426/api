import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/shared/entities/comment.entity';
import { PublicCommentsController } from '@/modules/comics/public/comments/controllers/comments.controller';
import { PublicCommentsService } from '@/modules/comics/public/comments/services/comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
  ],
  controllers: [PublicCommentsController],
  providers: [PublicCommentsService],
  exports: [PublicCommentsService],
})
export class PublicCommentsModule {}



