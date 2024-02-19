import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelMandateDtoDto {
  @IsString()
  @ApiProperty({
    description: 'productId',
    example: 'string',
    required: true,
    type: String,
  })
  productId: string;

  @IsString()
  @ApiProperty({
    description: 'clientPhone',
    example: 'string',
    required: true,
    type: String,
  })
  clientPhone: string;

  @IsString()
  @ApiProperty({
    description: 'TmandateId',
    example: 'string',
    required: true,
    type: String,
  })
  mandateId: string;

}
