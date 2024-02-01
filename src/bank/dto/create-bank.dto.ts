import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBankDto {
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be a string' })
  @ApiProperty({
    description: 'Name of the Bank',
    example: 'string',
    required: true,
    type: String,
  })
  name: string;
}
