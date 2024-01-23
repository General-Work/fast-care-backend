import { Module } from '@nestjs/common';
import { CorporateSubscribersService } from './corporate-subscribers.service';
import { CorporateSubscribersController } from './corporate-subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/pagination/pagination.module';
import { CorporateBeneficiaries } from './entities/corporate-beneficiaries.entity';
import { CorporatePackage } from './entities/corporate-package.entity';
import { CorporateSubscriber } from './entities/corporate-subscriber.entity';
import { CorporateSubscriberPayment } from './entities/corporate-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CorporateBeneficiaries,
      CorporatePackage,
      CorporateSubscriber,
      CorporateSubscriberPayment,
    ]),
    PaginationModule,
  ],
  controllers: [CorporateSubscribersController],
  providers: [CorporateSubscribersService],
})
export class CorporateSubscribersModule {}
