// shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from './pagination.service';
import { Group } from 'src/groups/entities/group.entity';

@Module({
  // imports: [TypeOrmModule.forFeature([Group])], 
  providers: [PaginationService],
  exports: [PaginationService],
})
export class PaginationModule {}
