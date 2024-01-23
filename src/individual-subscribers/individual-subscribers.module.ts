import { Module } from '@nestjs/common';
import { IndividualSubscribersService } from './individual-subscribers.service';
import { IndividualSubscribersController } from './individual-subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualSubscriber } from './entities/individual-subscriber.entity';
import { IndividualSubscriberPayment } from './entities/individual-subscriber-payment.entity';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualSubscriber,
      IndividualSubscriberPayment,
    ]),
    PaginationModule,
  ],
  controllers: [IndividualSubscribersController],
  providers: [IndividualSubscribersService],
})
export class IndividualSubscribersModule {}
