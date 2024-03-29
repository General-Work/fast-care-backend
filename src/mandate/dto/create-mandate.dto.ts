import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMandateDto {
  @IsString()
  @ApiProperty({
    description: 'responseCode',
    example: 'string',
    required: true,
    type: String,
  })
  responseCode: string;

  @IsString()
  @ApiProperty({
    description: 'responseMessage',
    example: 'string',
    required: true,
    type: String,
  })
  responseMessage: string;

  @IsString()
  @ApiProperty({
    description: 'merchantId',
    example: 'string',
    required: true,
    type: String,
  })
  merchantId: string;

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
    description: 'mandateId',
    example: 'string',
    required: true,
    type: String,
  })
  mandateId: string;

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
    description: 'thirdPartyReferenceNo',
    example: 'string',
    required: true,
    type: String,
  })
  thirdPartyReferenceNo: string;
}
