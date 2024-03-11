import { Module } from '@nestjs/common';
import { MandateService } from './mandate.service';
import { MandateController } from './mandate.controller';
import { PaginationModule } from 'src/pagination/pagination.module';
import { IndividualSubscribersModule } from 'src/individual-subscribers/individual-subscribers.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { CorporateSubscribersModule } from 'src/corporate-subscribers/corporate-subscribers.module';
import { FamilySubscribersModule } from 'src/family-subscribers/family-subscribers.module';

@Module({
  imports: [
    PaginationModule,
    IndividualSubscribersModule,
    PaymentsModule,
    CorporateSubscribersModule,
    FamilySubscribersModule,
  ],
  controllers: [MandateController],
  providers: [MandateService],
})
export class MandateModule {}
