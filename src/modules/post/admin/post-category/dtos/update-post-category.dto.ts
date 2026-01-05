import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCategoryDto } from '@/modules/post/admin/post-category/dtos/create-post-category.dto';

export class UpdatePostCategoryDto extends PartialType(CreatePostCategoryDto) { }

