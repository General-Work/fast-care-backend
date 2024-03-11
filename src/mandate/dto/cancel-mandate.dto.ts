import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelMandateDtoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  thirdPartyReferenceNo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'clientPhone',
    example: 'string',
    required: true,
    type: String,
  })
  clientPhone: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'TmandateId',
    example: 'string',
    required: true,
    type: String,
  })
  mandateId: string;
}
