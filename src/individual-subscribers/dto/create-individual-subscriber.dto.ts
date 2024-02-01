import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidationArguments,
} from 'class-validator';
import {
  DISCOUNT,
  FREQUENCY,
  GENDER,
  IDTYPES,
  MARITALSTATUS,
  MOMONETWORK,
  PAYMENTMODE,
} from 'src/lib';

export class CreateIndividualSubscriberDto {
  @IsNotEmpty({ message: 'ID Type can not be null' })
  @IsEnum(IDTYPES)
  @ApiProperty({
    enum: IDTYPES,
    example: IDTYPES.Passport,
  })
  idType: IDTYPES;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', nullable: true })
  passportPicture: string;

  @IsNotEmpty({ message: 'ID Number can not be null' })
  @IsString({ message: 'ID Number should be a string' })
  @ApiProperty()
  idNumber: string;

  @IsNotEmpty({ message: 'First name can not be null' })
  @IsString({ message: 'First name should be a string' })
  @ApiProperty()
  firstName: string;

  @IsOptional()
  @IsString({ message: 'Othername(s) should be a string' })
  @ApiProperty({ required: false })
  otherNames: string;

  @IsNotEmpty({ message: 'Othername(s) can not be null' })
  @IsString({ message: 'Othername(s) should be a string' })
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({ message: 'Date birth can not be null' })
  @IsString({ message: 'Date birth should be a string' })
  @ApiProperty()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsEnum(GENDER)
  @ApiProperty({
    enum: GENDER,
    example: GENDER.Male,
  })
  gender: GENDER;

  @IsNotEmpty({ message: 'Occupation can not be null' })
  @IsString({ message: 'Occupation should be a string' })
  @ApiProperty()
  occupation: string;

  @IsNotEmpty({ message: 'Marital Status can not be null' })
  @ApiProperty({ enum: MARITALSTATUS, example: MARITALSTATUS.Single })
  maritalStatus: MARITALSTATUS;

  @IsNotEmpty({ message: 'Address can not be null' })
  @IsString({ message: 'Address should be a string' })
  @ApiProperty()
  address: string;

  @IsNotEmpty({ message: 'GPS Address can not be null' })
  @IsString({ message: 'GPS Address should be a string' })
  @ApiProperty()
  gpsAddress: string;

  @IsNotEmpty({ message: 'Phone One can not be null' })
  @IsString({ message: 'Phone One should be a string' })
  @ApiProperty()
  phoneOne: string;

  @IsOptional()
  @IsString({ message: 'Phone Two should be a string' })
  @ApiProperty({ required: false })
  phoneTwo: string;

  @IsNotEmpty({ message: 'Full name of emeergency person can not be null' })
  @IsString({ message: 'Full name of emeergency person should be a string' })
  @ApiProperty({ type: String })
  emergencyPerson: string;

  @IsNotEmpty({ message: 'Phone number of emeergency person can not be null' })
  @IsString({ message: 'Phone number of emeergency person should be a string' })
  @ApiProperty({ type: String })
  emergencyPersonPhone: string;

  @IsNotEmpty()
  @ApiProperty({ example: false })
  hasNHIS: boolean;

  @IsOptional()
  @IsString({ message: 'NHIS Number should be a string' })
  @ApiProperty({ required: false })
  NHISNumber: string;

  @IsNotEmpty()
  @IsEnum(PAYMENTMODE)
  @ApiProperty({ enum: PAYMENTMODE, example: PAYMENTMODE.Cash })
  paymentMode: PAYMENTMODE;

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

  @IsNotEmpty()
  @IsEnum(FREQUENCY)
  @ApiProperty({ enum: FREQUENCY, example: FREQUENCY.Daily })
  frequency: FREQUENCY;

  @IsOptional()
  // @IsEnum(DISCOUNT)
  @ApiProperty({ enum: DISCOUNT, example: DISCOUNT['0%'] })
  discount: DISCOUNT;

  @IsOptional()
  @IsEnum(MOMONETWORK)
  @Validate((value, args: ValidationArguments) => {
    // Custom validation function to allow empty values
    if (value === '' || value === null || value === undefined) {
      return true;
    }

    return false;
  })
  @ApiProperty({ required: false, enum: MOMONETWORK, example: MOMONETWORK.MTN })
  momoNetwork: MOMONETWORK;

  @IsOptional()
  @IsString({ message: 'Momo Number should be a string' })
  @ApiProperty({ required: false })
  momoNumber: string;

  @IsNotEmpty({ message: 'Facility cannot  be null' })
  // @IsNumber()
  // @Min(1, { message: 'Facility should be greater than 0' })
  @ApiProperty({ type: Number, example: 1 })
  facility: number;

  @IsNotEmpty({ message: 'Package cannot  be null' })
  // @IsNumber()
  // @Min(1, { message: 'Package should be greater than 0' })
  @ApiProperty({ type: Number, example: 1 })
  package: number;

  @IsOptional()
  // @IsNumber({ allowInfinity: false, allowNaN: false })
  @ApiProperty({ required: false, type: Number })
  group: number;
}
