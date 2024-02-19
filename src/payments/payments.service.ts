import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualSubscriberPayment } from 'src/individual-subscribers/entities/individual-subscriber-payment.entity';
import { Repository } from 'typeorm';
import { PaginationService } from 'src/pagination/pagination.service';
import { CorporateSubscriberPayment } from 'src/corporate-subscribers/entities/corporate-payment.entity';
import { Payment } from './entities/payment.entity';
import { IPayment } from 'src/lib';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(IndividualSubscriberPayment)
    private readonly individualRepositoryPayment: Repository<IndividualSubscriberPayment>,
    private readonly paginationService: PaginationService,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll() {
    // return await this.indivialRepository
    //   .createQueryBuilder('payment')
    //   .select([
    //     'payment.id',
    //     'payment.dateOfPayment',
    //     'payment.dateOfSubscription',
    //     'payment.confirmed',
    //     'payment.confirmedBy',
    //     'payment.confirmedDate',
    //     'payment.paymentStatus',
    //     'payment.originalAmount',
    //     'payment.amountToDebit',
    //     'payment.mandateStatus',
    //     'payment.mandateID',
    //     'payment.createdAt',
    //     'payment.updatedAt',
    //     'payment.updatedBy',
    //     'payment.createdBy',
    //     'subscriber.id',
    //     'subscriber.idType',
    //     'subscriber.idNumber',
    //     'subscriber.membershipID',
    //     'subscriber.firstName',
    //     'subscriber.otherNames',
    //     'subscriber.lastName',
    //     'subscriber.dateOfBirth',
    //     'subscriber.gender',
    //     'subscriber.occupation',
    //     'subscriber.maritalStatus',
    //     'subscriber.address',
    //     'subscriber.gpsAddress',
    //     'subscriber.phoneOne',
    //     'subscriber.phoneTwo',
    //     'subscriber.emergencyPerson',
    //     'subscriber.emergencyPersonPhone',
    //     'subscriber.accountNumber',
    //     'subscriber.chequeNumber',
    //     'subscriber.CAGDStaffID',
    //     'subscriber.hasNHIS',
    //     'subscriber.NHISNumber',
    //     'subscriber.paymentMode',
    //     'subscriber.frequency',
    //     'subscriber.discount',
    //     'subscriber.momoNetwork',
    //     'subscriber.momoNumber',
    //     'subscriber.createdAt as subscriberCreatedAt',
    //     'subscriber.updatedAt as subscriberUpdatedAt',
    //     'subscriber.updatedBy as subscriberUpdatedBy',
    //     'subscriber.createdBy as subscriberCreatedBy',
    //   ])
    //   .leftJoin('payment.subscriber', 'subscriber')
    //   .getMany();
    return this.paymentRepository.find()
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
}
