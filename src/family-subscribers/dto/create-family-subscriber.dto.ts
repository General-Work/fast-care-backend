import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilySubscriberDto {
  @IsNotEmpty({ message: 'Family name can not be null' })
  @IsString({ message: 'Family name should be a string' })
  @ApiProperty()
  name: string;

  @IsNotEmpty({ message: 'Address of family can not be null' })
  @IsString({ message: 'Address of family should be a string' })
  @ApiProperty()
  address: string;

  @IsNotEmpty({ message: 'Family contact can not be null' })
  @IsString({ message: 'Family contact should be a string' })
  @ApiProperty()
  contact: string;

  @IsNotEmpty({ message: 'Family principal person can not be null' })
  @IsString({ message: 'Family principal person should be a string' })
  @ApiProperty()
  principalPerson: string;

  @IsNotEmpty({ message: 'Family principal person phone can not be null' })
  @IsString({ message: 'Family principal person phone should be a string' })
  @ApiProperty()
  principalPersonPhone: string;

  @IsNotEmpty({ message: 'Family principal person phone can not be null' })
  @IsEmail()
  @ApiProperty()
  email: string;
}
