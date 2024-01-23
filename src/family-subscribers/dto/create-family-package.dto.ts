import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DISCOUNT, FREQUENCY, MOMONETWORK, PAYMENTMODE } from 'src/lib';

export class CreateFamilyPackageDto {
  @IsNotEmpty({ message: 'Family can not be null' })
  @IsNumber()
  @ApiProperty()
  familyId: number;

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
}
