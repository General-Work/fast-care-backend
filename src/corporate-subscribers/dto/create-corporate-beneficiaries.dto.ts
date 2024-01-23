import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCorporateBeneficiaryDto {
  @IsNotEmpty({ message: 'corporate can not be null' })
  @IsNumber()
  @ApiProperty()
  corporateId: number;

  @IsNotEmpty({ message: 'corporate name can not be null' })
  @IsString({ message: 'corporate name should be a string' })
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
