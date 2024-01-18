import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Staff ID can not be null' })
  @IsNumber()
  @ApiProperty({
    description: 'Staff ID of the group',
    example: '1',
    required: true,
    type: Number,
  })
  staffDbId: number;

  @IsNotEmpty({ message: 'Email can not be null' })
  @IsEmail()
  @ApiProperty({
    description: 'Email of the staff',
    example: 'string@mail.com',
    required: true,
    type: String,
  })
  email: string;

  @IsNotEmpty({ message: 'Role ID can not be null' })
  @IsNumber()
  @ApiProperty({
    description: 'Role ID of the group',
    example: '1',
    required: true,
    type: Number,
  })
  roleId: number;

  @IsNotEmpty({ message: 'Role ID can not be null' })
  @IsNumber()
  @ApiProperty({
    description: 'Role ID of the group',
    example: '1',
    required: true,
    type: Number,
  })
  facilityId: number;
}
