import { Module } from '@nestjs/common';
import { MandateService } from './mandate.service';
import { MandateController } from './mandate.controller';
import { PaginationModule } from 'src/pagination/pagination.module';
import { IndividualSubscribersModule } from 'src/individual-subscribers/individual-subscribers.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [PaginationModule, IndividualSubscribersModule, PaymentsModule],
  controllers: [MandateController],
  providers: [MandateService],
})
export class MandateModule {}
