import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email can not be null' })
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'test@mail.com',
    required: true,
    type: String,
  })
  username: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @ApiProperty({
    description: 'Password of the user',
    example: 'string',
    required: true,
    type: String,
  })
  password: string;
}
