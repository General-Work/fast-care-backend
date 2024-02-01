import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bank]), PaginationModule],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
