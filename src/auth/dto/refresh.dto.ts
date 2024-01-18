import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsNotEmpty({ message: 'Refresh cannot be empty' })
  @IsString({ message: 'Refresh must be a string' })
  @ApiProperty({
    description: 'Refresh token of the user',
    example: 'string',
    required: true,
    type: String,
  })
  refresh: string;
}
