import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { IndividualSubscriberPayment } from '../individual-subscribers/entities/individual-subscriber-payment.entity';
import { CorporateSubscriberPayment } from '../corporate-subscribers/entities/corporate-payment.entity';
import { FamilySubscriberPayment } from '../family-subscribers/entities/family-subscriber-payment.entity';
import { Payment } from './entities/payment.entity';
import { PaginationModule } from '../pagination/pagination.module';
import { IndividualSubscribersModule } from '../individual-subscribers/individual-subscribers.module';
import { FamilySubscribersModule } from '../family-subscribers/family-subscribers.module';
import { CorporateSubscribersModule } from '../corporate-subscribers/corporate-subscribers.module';
import { AllSubscribers } from './entities/all-subscribers.entity';
import { Bank } from 'src/bank/entities/bank.entity';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualSubscriberPayment,
      CorporateSubscriberPayment,
      FamilySubscriberPayment,
      Payment,
      Bank,
      AllSubscribers,
    ]),
    StaffModule,
    PaginationModule,
    forwardRef(() => IndividualSubscribersModule),
    forwardRef(() => FamilySubscribersModule),
    forwardRef(() => CorporateSubscribersModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
