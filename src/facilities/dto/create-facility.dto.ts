import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFacilityDto {
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be a string' })
  @ApiProperty({
    description: 'Name of the facility',
    example: 'string',
    required: true,
    type: String,
  })
  name: string;

  @IsNotEmpty({ message: 'Phone Number can not be null' })
  @IsString({ message: 'Phone Number should be a string' })
  // @IsP
  @ApiProperty({
    description: 'Phone Number of the facility',
    example: '0241234567',
    required: true,
    type: String,
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Address can not be null' })
  @IsString({ message: 'Address should be a string' })
  @ApiProperty({
    description: 'Address of the facility',
    example: 'string',
    required: true,
    type: String,
  })
  address: string;

  @IsOptional()
  @IsString({ message: 'GPS should be a string' })
  @ApiProperty({
    description: 'GPS of the facility',
    example: 'string',
    required: false,
    type: String,
  })
  gpsAddress: string;
}
