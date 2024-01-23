import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCorporateSubscriberDto {
  @IsNotEmpty({ message: 'corporate ID can not be null' })
  @IsString({ message: 'corporate ID should be a string' })
  @ApiProperty()
  idNumber: string;

  @IsNotEmpty({ message: 'corporate name can not be null' })
  @IsString({ message: 'corporate name should be a string' })
  @ApiProperty()
  name: string;

  @IsNotEmpty({ message: 'Address of corporate can not be null' })
  @IsString({ message: 'Address of corporate should be a string' })
  @ApiProperty()
  address: string;

  @IsNotEmpty({ message: 'corporate contact can not be null' })
  @IsString({ message: 'corporate contact should be a string' })
  @ApiProperty()
  contact: string;

  @IsNotEmpty({ message: 'corporate principal person can not be null' })
  @IsString({ message: 'corporate principal person should be a string' })
  @ApiProperty()
  principalPerson: string;

  @IsNotEmpty({ message: 'corporate principal person phone can not be null' })
  @IsString({ message: 'corporate principal person phone should be a string' })
  @ApiProperty()
  principalPersonPhone: string;

  @IsNotEmpty({ message: 'corporate principal person phone can not be null' })
  @IsEmail()
  @ApiProperty()
  email: string;
}
