import { Module, forwardRef } from '@nestjs/common';
import { CorporateSubscribersService } from './corporate-subscribers.service';
import { CorporateSubscribersController } from './corporate-subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/pagination/pagination.module';
import { CorporateBeneficiaries } from './entities/corporate-beneficiaries.entity';
import { CorporatePackage } from './entities/corporate-package.entity';
import { CorporateSubscriber } from './entities/corporate-subscriber.entity';
import { CorporateSubscriberPayment } from './entities/corporate-payment.entity';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CorporateBeneficiaries,
      CorporatePackage,
      CorporateSubscriber,
      CorporateSubscriberPayment,
    ]),
    PaginationModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [CorporateSubscribersController],
  providers: [CorporateSubscribersService],
  exports: [CorporateSubscribersService],
})
export class CorporateSubscribersModule {}
