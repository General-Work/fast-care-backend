import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
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
import {
  IPayment,
  ISubscriberDto,
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
  SUBSCRIBER_PAYMENT_STATUS,
  calculateDiscount,
  getCurrentPaymentDate,
  sumPackageAmounts,
} from 'src/lib';
// import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
// import { FamilySubscriber } from 'src/family-subscribers/entities/family-subscriber.entity';
// import { CorporateSubscriber } from 'src/corporate-subscribers/entities/corporate-subscriber.entity';
// import { FamilySubscriberPayment } from 'src/family-subscribers/entities/family-subscriber-payment.entity';
import { IndividualSubscribersService } from 'src/individual-subscribers/individual-subscribers.service';
import { FamilySubscribersService } from 'src/family-subscribers/family-subscribers.service';
import { CorporateSubscribersService } from 'src/corporate-subscribers/corporate-subscribers.service';
import { AllSubscribers } from './entities/all-subscribers.entity';
import { PremiumPayment } from './dto/premium-payment.dto';
import { Bank } from 'src/bank/entities/bank.entity';

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

    @InjectRepository(AllSubscribers)
    private readonly allSubscriberRepository: Repository<AllSubscribers>,
  ) {}

  async findAll(options: PaginationOptions) {
    return this.paginationService.paginate({
      ...options,
      repository: this.paymentRepository,
      relations: ['bank'],
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
      info.agentId = data.agentId;

      await this.paymentRepository.save(info);
    } catch (error) {
      throw error;
    }
  }

  async fetchSubscribersAllSubscribers(options: PaginationOptions) {
    const subscribers = await this.paginationService.paginate({
      ...options,
      repository: this.allSubscriberRepository,
      relations: ['bank'],
    });

    const newData = await Promise.all(
      subscribers.data.map(async (d: AllSubscribers) => {
        let amountDue: number = 0;
        let daysSinceLastPayment: number | null = null;
        let subscriberDetails: any;
        let paymentStatus: SUBSCRIBER_PAYMENT_STATUS;

        switch (d.subscriberType) {
          case SUBSCRIBERTYPE.Individual:
            subscriberDetails =
              await this.individualSubscriberService.findOneById(
                d.subscriberId,
              );
            break;
          case SUBSCRIBERTYPE.Corporate:
            subscriberDetails =
              await this.corporateSubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            break;
          default:
            subscriberDetails =
              await this.familySubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            break;
        }

        const payments = await this.findSubscriberPayments(d.subscriberId);

        if (payments.length === 0) {
          paymentStatus = SUBSCRIBER_PAYMENT_STATUS.NoPayment;
        }

        if (subscriberDetails && payments.length > 0) {
          const packageAmount =
            d.subscriberType === SUBSCRIBERTYPE.Individual
              ? subscriberDetails.package.amount
              : sumPackageAmounts(subscriberDetails.beneficiaries);

          const currentPayment = getCurrentPaymentDate(payments);
          if (currentPayment !== null) {
            amountDue = +(
              (packageAmount / 30) *
              currentPayment.daysDifference
            ).toFixed(2);
            daysSinceLastPayment = currentPayment.daysDifference;
            paymentStatus =
              daysSinceLastPayment === 0
                ? SUBSCRIBER_PAYMENT_STATUS.Today
                : SUBSCRIBER_PAYMENT_STATUS.AmountDue;
          } else {
            paymentStatus = SUBSCRIBER_PAYMENT_STATUS.NotConfirmed;
          }
        }

        return {
          ...d,
          amountDue,
          daysSinceLastPayment,
          paymentStatus,
        };
      }),
    );

    return {
      ...subscribers,
      data: newData,
    };
  }

  async addToAllSubscribers(data: ISubscriberDto) {
    try {
      const subscriber = this.allSubscriberRepository.create(data);
      await this.allSubscriberRepository.save(subscriber);
    } catch (e) {
      throw e;
    }
  }

  async findSubscriberPayments(id: number) {
    return this.paymentRepository.find({ where: { subscriberDbId: id } });
  }
  async updateSubscriber(referenceCode: string, data: Partial<ISubscriberDto>) {
    try {
      const subscriber = await this.allSubscriberRepository.findOneBy({
        paymentReferenceCode: referenceCode,
      });
      const m = Object.assign(subscriber, data);
      await this.allSubscriberRepository.save(m);
    } catch (e) {
      throw e;
    }
  }

  async makePremiumPayment(
    data: PremiumPayment,
    createdBy: string,
    agent: number,
  ) {
    try {
      const subscriber = await this.allSubscriberRepository.findOneBy({
        id: data.dbId,
      });
      if (!subscriber) {
        throw new NotFoundException(`Subscriber not found.`);
      }
      if (data.paymentMode !== PAYMENTMODE.MOMO) {
        const payment = new Payment();
        payment.amount = calculateDiscount(data.amount, data.discount);
        payment.agentId = agent;
        payment.amountWithOutDiscount = data.amount;
        payment.confirmed = false;
        payment.confirmedBy = '';
        payment.dateOfPayment = new Date();
        payment.debitOrderTransactionId = null;
        payment.mandateId = null;
        payment.paymentReferenceCode = subscriber.paymentReferenceCode;
        payment.momTransactionId = null;
        payment.paymentMode = data.paymentMode;
        payment.paymentStatus = PAYMENTSTATUS.Unpaid;
        payment.subscriberDbId = subscriber.subscriberId;
        payment.subscriberName = subscriber.name;
        payment.subscriberPaymentDbId =
          subscriber.subscriberType === SUBSCRIBERTYPE.Individual
            ? subscriber.individualPaymentId
            : subscriber.subscriberType === SUBSCRIBERTYPE.Family
              ? subscriber.familyPaymentId
              : subscriber.corporatePaymentId;
        payment.subscriberType = subscriber.subscriberType;
        payment.createdBy = createdBy;
        payment.narration = data.narration;

        if (data.paymentMode === PAYMENTMODE.Cash) {
          payment.momoNetwork = MOMONETWORK.None;
          payment.momoNumber = '';
          payment.CAGDStaffID = '';
          payment.chequeNumber = '';
          payment.accountNumber = '';
          payment.bank = null;
        } else if (data.paymentMode === PAYMENTMODE.CAGD) {
          payment.momoNetwork = MOMONETWORK.None;
          payment.momoNumber = '';
          payment.CAGDStaffID = data.CAGDStaffID;
          payment.chequeNumber = '';
          payment.accountNumber = '';
          payment.bank = null;
        } else if (data.paymentMode === PAYMENTMODE.Cheque) {
          payment.momoNetwork = MOMONETWORK.None;
          payment.momoNumber = '';
          payment.CAGDStaffID = '';
          payment.chequeNumber = data.chequeNumber;
          payment.accountNumber = '';
          if (data.bank) {
            const bank = new Bank();
            bank.id = data.bank;
            payment.bank = bank;
          } else {
            payment.bank = null;
          }
        } else if (data.paymentMode === PAYMENTMODE.StandingOrder) {
          payment.momoNetwork = MOMONETWORK.None;
          payment.momoNumber = '';
          payment.CAGDStaffID = '';
          payment.chequeNumber = '';
          payment.accountNumber = data.accountNumber;
          if (data.bank) {
            const bank = new Bank();
            bank.id = data.bank;
            payment.bank = bank;
          } else {
            payment.bank = null;
          }
        }

        await this.paymentRepository.save(payment);

        return {
          message: 'Payment made successfully',
          status: HttpStatus.OK,
          success: true,
        };
      } else {
        throw new BadRequestException('Momo Payment not available now');
      }
    } catch (e) {
      throw e;
    }
  }

  async confirmPayment(id: number, confirmBy: string) {
    try {
      const payment = await this.paymentRepository.findOneBy({ id });
      if (!payment) {
        throw new BadRequestException('No payment found');
      }
      payment.confirmed = true;
      payment.confirmedBy = confirmBy;
      payment.confirmedDate = new Date();
      payment.paymentStatus = PAYMENTSTATUS.Paid;

      await this.paymentRepository.save(payment);
      return {
        message: 'Successfully confirmed payment',
        success: true,
        status: HttpStatus.OK,
      };
    } catch (e) {
      throw e;
    }
  }

  // async updateCreatedAtToPaymentDate(): Promise<void> {
  //   try {
  //     const paymentsToUpdate = await this.paymentRepository.find({
  //       select: ['id', 'dateOfPayment'],
  //     });

  //     for (const payment of paymentsToUpdate) {
  //       await this.paymentRepository.update(
  //         { id: payment.id },
  //         { createdAt: payment.dateOfPayment },
  //       );
  //     }
  //   } catch (error) {
  //     // Handle error appropriately
  //     console.error('Error occurred while updating createdAt:', error);
  //   }
  // }
}
