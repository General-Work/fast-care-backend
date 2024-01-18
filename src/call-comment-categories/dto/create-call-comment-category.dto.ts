import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCallCommentCategoryDto {
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be a string' })
  @ApiProperty({
    description: 'Name of the call comment category',
    example: 'string',
    required: true,
    type: String,
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description should be a string' })
  @ApiProperty({
    description: 'Description of the call comment category',
    example: 'string',
    type: String,
    required: false,
  })
  description: string;
}
