import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GENDER, IDTYPES, MARITALSTATUS, TITLE } from 'src/lib';

export class CreateStaffDto {
  @IsNotEmpty({ message: 'Title can not be null' })
  @ApiProperty({
    description: 'Title of the staff',
    example: TITLE.Mr,
    required: true,
    enum: TITLE,
  })
  title: TITLE;

  @IsNotEmpty({ message: 'First name can not be null' })
  @IsString({ message: 'First name should be a string' })
  @ApiProperty({
    description: 'First name of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  firstName: string;

  @IsNotEmpty({ message: 'Last name can not be null' })
  @IsString({ message: 'Last name should be a string' })
  @ApiProperty({
    description: 'Last name of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Other name(s) should be a string' })
  @ApiProperty({
    description: 'Other name(s) of the staff',
    example: 'string',
    required: false,
    type: String,
  })
  otherNames: string;

  @IsNotEmpty({ message: 'Gender can not be null' })
  @IsEnum(GENDER)
  @ApiProperty({
    description: 'Gender of the staff',
    example: 'Male',
    required: true,
    enum: GENDER,
  })
  gender: GENDER;

  @IsNotEmpty({ message: 'Phone number can not be null' })
  @IsString({ message: 'Phone number should be a string' })
  @ApiProperty({
    description: 'Phone number of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Email can not be null' })
  @IsEmail()
  @ApiProperty({
    description: 'Email of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  email: string;

  @IsNotEmpty({ message: 'Nationality can not be null' })
  @IsString({ message: 'Nationality should be a string' })
  @ApiProperty({
    description: 'Nationality of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  nationality: string;

  @IsNotEmpty({ message: 'Position can not be null' })
  @IsString({ message: 'Position should be a string' })
  @ApiProperty({
    description: 'Position of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  position: string;

  @IsNotEmpty({ message: 'Marital status can not be null' })
  @IsEnum(MARITALSTATUS)
  @ApiProperty({
    description: 'Marital status of the staff',
    example: MARITALSTATUS.Single,
    required: true,
    enum: MARITALSTATUS,
  })
  marritalStatus: MARITALSTATUS;

  @IsNotEmpty({ message: 'ID type can not be null' })
  @ApiProperty({
    description: 'ID type of the staff',
    example: IDTYPES.DriverLicense,
    required: true,
    enum: IDTYPES,
  })
  idType: IDTYPES;

  @IsNotEmpty({ message: 'ID Number can not be null' })
  @IsString({ message: 'ID Number should be a string' })
  @ApiProperty({
    description: 'ID Number of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  idNumber: string;

  @IsNotEmpty({ message: 'Date of Birth can not be null' })
  @IsString({ message: 'Date of Birth should be a string' })
  @ApiProperty({
    description: 'Date of Birth of the staff',
    example: 'string',
    required: true,
    type: String,
  })
  dateOfBirth: string;
}
