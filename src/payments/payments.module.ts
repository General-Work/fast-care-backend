import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualSubscriberPayment } from 'src/individual-subscribers/entities/individual-subscriber-payment.entity';
import { PaginationModule } from 'src/pagination/pagination.module';
import { CorporateSubscriberPayment } from 'src/corporate-subscribers/entities/corporate-payment.entity';
import { FamilySubscriberPayment } from 'src/family-subscribers/entities/family-subscriber-payment.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualSubscriberPayment,
      CorporateSubscriberPayment,
      FamilySubscriberPayment,
      Payment
    ]),
    PaginationModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
