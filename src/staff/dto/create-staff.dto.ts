import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GENDER, IDOPTIONS, MARITALSTATUS, TITLE } from 'src/lib';
import {
  IDTYPES,
  STAFFMARITALSTATUS,
  STAFFGENDER,
  STAFFTITLE,
} from 'src/types';

export class CreateStaffDto {
  @IsNotEmpty({ message: 'Title can not be null' })
  @IsString({ message: 'Title should be a string' })
  @IsIn(TITLE, { message: 'Invalid title' })
  @ApiProperty({
    description: 'Title of the staff',
    example: 'string',
    required: true,
    enum: TITLE,
  })
  title: STAFFTITLE;

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
  @IsString({ message: 'Gender should be a string' })
  @IsIn(GENDER, { message: 'Invalid gender' })
  @ApiProperty({
    description: 'Gender of the staff',
    example: 'Male',
    required: true,
    enum: GENDER,
  })
  gender: STAFFGENDER;

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
  @IsString({ message: 'Marital status should be a string' })
  @IsIn(MARITALSTATUS, { message: 'Invalid marital status' })
  @ApiProperty({
    description: 'Marital status of the staff',
    example: 'string',
    required: true,
    enum: MARITALSTATUS,
  })
  marritalStatus: STAFFMARITALSTATUS;

  @IsNotEmpty({ message: 'ID type can not be null' })
  @IsString({ message: 'ID type should be a string' })
  @IsIn(IDOPTIONS, { message: 'Invalid ID type' })
  @ApiProperty({
    description: 'ID type of the staff',
    example: 'string',
    required: true,
    enum: IDOPTIONS,
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
