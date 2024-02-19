import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TransactionDto {
  @IsString()
  @ApiProperty({
    description: 'Respose code',
    example: 'string',
    required: true,
    type: String,
  })
  responseCode: string;

  @IsString()
  @ApiProperty({
    description: 'Respose message',
    example: 'string',
    required: true,
    type: String,
  })
  responseMessage: string;

  @IsString()
  @ApiProperty({
    description: 'Transaction ID',
    example: 'string',
    required: true,
    type: String,
  })
  momTransactionId: string;

  @IsString()
  @ApiProperty({
    description: 'Debit order transaction ID',
    example: 'string',
    required: true,
    type: String,
  })
  debitOrderTransactionId: string;

  @IsString()
  @ApiProperty({
    description: 'Merchant ID',
    example: 'string',
    required: true,
    type: String,
  })
  merchantId: string;

  @IsString()
  @ApiProperty({
    description: 'Product ID',
    example: 'string',
    required: true,
    type: String,
  })
  productId: string;

  @IsString()
  @ApiProperty({
    description: 'Mandate ID',
    example: 'string',
    required: true,
    type: String,
  })
  mandateId: string;

  @IsString()
  @ApiProperty({
    description: 'Client Phone',
    example: 'string',
    required: true,
    type: String,
  })
  clientPhone: string;

  @IsString()
  @ApiProperty({
    description: 'Amount',
    example: 'string',
    required: true,
    type: String,
  })
  amount: string;

  @IsString()
  @ApiProperty({
    description: 'thirdPartyReferenceNo',
    example: 'string',
    required: true,
    type: String,
  })
  thirdPartyReferenceNo: string;
}
