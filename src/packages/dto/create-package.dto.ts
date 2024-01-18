import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePackageDto {
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be a string' })
  @ApiProperty({
    description: 'Name of the package',
    example: 'string',
    type: String,
    required: true,
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description should be a string' })
  @ApiProperty({
    description: 'Description of the package',
    example: 'string',
    type: String,
    required: false,
  })
  description: string;

  @IsNotEmpty({ message: 'Amount can not be null' })
  @IsNumber()
  @Min(1, { message: 'Amount should be greater than 0' })
  @ApiProperty({
    description: 'Amount of the package',
    example: 100, // Use an example value
    type: Number,
    required: true,
  })
  amount: number;
}
