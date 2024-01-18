import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { PERMISSIONS } from 'src/lib';

@ApiTags('Permissions')
@UseGuards(JwtGuard)
@Controller('permissions')
export class PermissionController {
  @Get()
  findAll() {
    return {
      success: true,
      message: 'success',
      items: PERMISSIONS,
    };
  }
}
