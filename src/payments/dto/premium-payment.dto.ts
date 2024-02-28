import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DISCOUNT, MOMONETWORK, PAYMENTMODE } from 'src/lib';

export class PremiumPayment {
  @IsNumber()
  @ApiProperty()
  dbId: number;

  @IsNotEmpty({ message: "Discount can't be null" })
  @IsEnum(DISCOUNT)
  @ApiProperty({ enum: DISCOUNT, example: DISCOUNT['0%'] })
  discount: DISCOUNT;

  @IsNotEmpty({ message: "Mode of payment can't be null" })
  @IsEnum(PAYMENTMODE)
  @ApiProperty({ enum: PAYMENTMODE, example: PAYMENTMODE.Cash })
  paymentMode: PAYMENTMODE;

  @IsOptional()
  @IsString({ message: 'MOMO number should be string' })
  @ApiProperty({ required: false })
  momoNumber: string;

  @ApiProperty()
  amount: number;

  @IsOptional()
  // @IsEnum(MOMONETWORK)
  @ApiProperty({
    enum: MOMONETWORK,
    example: MOMONETWORK.None,
    required: false,
  })
  momoNetwork: MOMONETWORK;

  @IsOptional()
  @ApiProperty({ required: false, type: Number })
  bank: number;

  @IsOptional()
  @IsString({ message: 'Account Number should be a string' })
  @ApiProperty({ required: false })
  accountNumber: string;

  @IsOptional()
  @IsString({ message: 'Cheque should be a string' })
  @ApiProperty({ required: false })
  chequeNumber: string;

  @IsOptional()
  @IsString({ message: 'CAGD Staff ID should be a string' })
  @ApiProperty({ required: false })
  CAGDStaffID: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  narration: string;
}
