import { PartialType } from '@nestjs/swagger';
import { CreateCallCommentCategoryDto } from './create-call-comment-category.dto';

export class UpdateCallCommentCategoryDto extends PartialType(CreateCallCommentCategoryDto) {}
