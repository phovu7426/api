import { PartialType } from '@nestjs/mapped-types';
import { CreatePostTagDto } from '@/modules/post/admin/post-tag/dtos/create-post-tag.dto';

export class UpdatePostTagDto extends PartialType(CreatePostTagDto) { }

