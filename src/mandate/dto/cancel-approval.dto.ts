import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelApprovalDto {
  @IsString()
  @ApiProperty({
    description: 'clientPhone',
    example: 'string',
    required: true,
    type: String,
  })
  clientPhone: string;
}
