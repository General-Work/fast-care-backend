import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PaginationModule } from 'src/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PaginationModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
