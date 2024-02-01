import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DISCOUNT, FREQUENCY, MOMONETWORK, PAYMENTMODE } from 'src/lib';

export class CreateCorporatePackageDto {
  @IsNotEmpty({ message: 'Corporate can not be null' })
  @IsNumber()
  @ApiProperty()
  corporateId: number;

  @IsNotEmpty({ message: "Discount can't be null" })
  @IsEnum(DISCOUNT)
  @ApiProperty({ enum: DISCOUNT, example: DISCOUNT['0%'] })
  discount: DISCOUNT;

  @IsNotEmpty({ message: "Mode of payment can't be null" })
  @IsEnum(PAYMENTMODE)
  @ApiProperty({ enum: PAYMENTMODE, example: PAYMENTMODE.Cash })
  paymentMode: PAYMENTMODE;

  @IsNotEmpty({ message: 'Amount can not be null' })
  @IsNumber()
  @ApiProperty()
  amountToDebit: number;

  @IsNotEmpty({ message: "Frequency can't be null" })
  @IsEnum(FREQUENCY)
  @ApiProperty({ enum: FREQUENCY, example: FREQUENCY.Daily })
  frequency: FREQUENCY;

  @IsOptional()
  // @IsEnum(MOMONETWORK)
  @ApiProperty({ enum: MOMONETWORK, example: MOMONETWORK.MTN, required: false })
  momoNetwork: MOMONETWORK;

  @IsOptional()
  @IsString({ message: 'MOMO number should be string' })
  @ApiProperty({ required: false })
  momoNumber: string;

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
}
