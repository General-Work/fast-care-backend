import { Module } from '@nestjs/common';
import { FamilySubscribersService } from './family-subscribers.service';
import { FamilySubscribersController } from './family-subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyBeneficiaries } from './entities/family-beneficiaries.entity';
import { FamilyPackage } from './entities/family-package.entity';
import { FamilySubscriber } from './entities/family-subscriber.entity';
import { FamilySubscriberPayment } from './entities/family-subscriber-payment.entity';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FamilyBeneficiaries,
      FamilyPackage,
      FamilySubscriber,
      FamilySubscriberPayment,
    ]),
    PaginationModule,
  ],
  controllers: [FamilySubscribersController],
  providers: [FamilySubscribersService],
})
export class FamilySubscribersModule {}
