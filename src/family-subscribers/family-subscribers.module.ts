import { Module, forwardRef } from '@nestjs/common';
import { FamilySubscribersService } from './family-subscribers.service';
import { FamilySubscribersController } from './family-subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyBeneficiaries } from './entities/family-beneficiaries.entity';
import { FamilyPackage } from './entities/family-package.entity';
import { FamilySubscriber } from './entities/family-subscriber.entity';
import { FamilySubscriberPayment } from './entities/family-subscriber-payment.entity';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PaymentsModule } from 'src/payments/payments.module';
// import { PackagesModule } from 'src/packages/packages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FamilyBeneficiaries,
      FamilyPackage,
      FamilySubscriber,
      FamilySubscriberPayment,
      // PackagesModule
    ]),
    forwardRef(() => PaymentsModule),
    PaginationModule,
  ],
  controllers: [FamilySubscribersController],
  providers: [FamilySubscribersService],
  exports: [FamilySubscribersService],
})
export class FamilySubscribersModule {}
