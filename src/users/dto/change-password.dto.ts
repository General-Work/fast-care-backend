import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangePasswordDto {

  @IsNotEmpty({ message: 'Old password can not be null' })
  @IsString({ message: 'Old password is required' })
  @ApiProperty({
    description: 'Old Password of the staff',
    example: '*****',
    required: true,
    type: String,
  })
  oldPassword: string;

  @IsNotEmpty({ message: 'New password can not be null' })
  @IsString({ message: 'New password is required' })
  @ApiProperty({
    description: 'New Password of the staff',
    example: '*****',
    required: true,
    type: String,
  })
  newPassword: string;
}
