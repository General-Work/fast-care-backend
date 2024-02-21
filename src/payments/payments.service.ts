import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualSubscriberPayment } from 'src/individual-subscribers/entities/individual-subscriber-payment.entity';
import { Repository } from 'typeorm';
import {
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
// import { CorporateSubscriberPayment } from 'src/corporate-subscribers/entities/corporate-payment.entity';
import { Payment } from './entities/payment.entity';
import { IPayment } from 'src/lib';
// import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
// import { FamilySubscriber } from 'src/family-subscribers/entities/family-subscriber.entity';
// import { CorporateSubscriber } from 'src/corporate-subscribers/entities/corporate-subscriber.entity';
// import { FamilySubscriberPayment } from 'src/family-subscribers/entities/family-subscriber-payment.entity';
import { IndividualSubscribersService } from 'src/individual-subscribers/individual-subscribers.service';
import { FamilySubscribersService } from 'src/family-subscribers/family-subscribers.service';
import { CorporateSubscribersService } from 'src/corporate-subscribers/corporate-subscribers.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(IndividualSubscriberPayment)
    private readonly individualRepositoryPayment: Repository<IndividualSubscriberPayment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => IndividualSubscribersService))
    private readonly individualSubscriberService: IndividualSubscribersService,
    @Inject(forwardRef(() => FamilySubscribersService))
    private readonly familySubscriberService: FamilySubscribersService,
    @Inject(forwardRef(() => CorporateSubscribersService))
    private readonly corporateSubscriberService: CorporateSubscribersService,
  ) {}

  async findAll(options: PaginationOptions) {
    return this.paginationService.paginate({
      ...options,
      repository: this.paymentRepository,
    });
  }

  async makePayment(data: IPayment) {
    try {
      const info = new Payment();

      info.amount = data.amount;
      info.amountWithOutDiscount = data.amountWithOutDiscount;
      info.confirmed = data.confirmed;
      info.confirmedBy = data.confirmedBy;
      info.dateOfPayment = data.dateOfPayment;
      info.debitOrderTransactionId = data.debitOrderTransactionId;
      info.mandateId = data.mandateId;
      info.paymentReferenceCode = data.paymentReferenceCode;
      info.momTransactionId = data.momTransactionId;
      info.paymentMode = data.paymentMode;
      info.paymentStatus = data.paymentStatus;
      info.subscriberDbId = data.subscriberDbId;
      info.subscriberName = data.subscriberName;
      info.subscriberPaymentDbId = data.subscriberPaymentDbId;
      info.subscriberType = data.subscriberType;

      await this.paymentRepository.save(info);
    } catch (error) {
      throw error;
    }
  }

  async fetchSubscribersAllSubscribers() {
    const individualSubscriber =
      await this.individualSubscriberService.findAllWithoutPagination();
    return individualSubscriber;
  }
}
