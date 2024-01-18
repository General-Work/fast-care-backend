import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), PaginationModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
