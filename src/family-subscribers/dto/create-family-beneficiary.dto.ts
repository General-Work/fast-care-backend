import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFamilyBeneficiaryDto {
  @IsNotEmpty({ message: 'Family can not be null' })
  @IsNumber()
  @ApiProperty()
  familyId: number;

  @IsNotEmpty({ message: 'Family name can not be null' })
  @IsString({ message: 'Family name should be a string' })
  @ApiProperty()
  name: string;

  @IsNotEmpty({ message: 'Date of Birth can not be null' })
  @IsString({ message: 'Date of Birth should be a string' })
  @ApiProperty()
  dateOfBirth: string;

  @IsNotEmpty({ message: 'Contact can not be null' })
  @IsString({ message: 'Contact should be a string' })
  @ApiProperty()
  contact: string;

  @IsNotEmpty({ message: 'Facility can not be null' })
  @IsNumber()
  @ApiProperty()
  facility: number;

  @IsNotEmpty({ message: 'Package can not be null' })
  @IsNumber()
  @ApiProperty()
  package: number;
}
