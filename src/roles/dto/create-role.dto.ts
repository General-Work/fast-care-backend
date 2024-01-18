import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { PERMISSIONS } from 'src/lib';
import { IPERMISSION } from 'src/types';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be a string' })
  @ApiProperty({
    description: 'Name of the permission',
    example: 'string',
    required: true,
    type: String,
  })
  name: string;

  @IsNotEmpty({ message: 'Permissions can not be null' })
  @IsArray({ message: 'Permissions should be an array' })
  @IsString({ each: true, message: 'Each permission should be a string' })
  @ApiProperty({
    description: 'Permissions of the user',
    example: ['string'],
    required: true,
    type: String,
    isArray: true,
    enum: PERMISSIONS,
  })
  permissions: IPERMISSION[];
}
