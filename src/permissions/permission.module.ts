import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';

@Module({
  controllers: [PermissionController],
  // providers: [RolesService],
})
export class PermissionsModule {}
