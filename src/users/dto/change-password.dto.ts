import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Staff ID can not be null' })
  @IsNumber()
  @ApiProperty({
    description: 'Staff ID of the group',
    example: '1',
    required: true,
    type: Number,
  })
  id: number;

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
