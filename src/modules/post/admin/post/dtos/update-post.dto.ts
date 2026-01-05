import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from '@/modules/post/admin/post/dtos/create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) { }

