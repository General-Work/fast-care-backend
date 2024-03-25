import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualSubscriberPayment } from 'src/individual-subscribers/entities/individual-subscriber-payment.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { Payment } from './entities/payment.entity';
import {
  IPayment,
  ISubscriberDto,
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
  SUBSCRIBER_PAYMENT_STATUS,
  SUBSCRIBER_STANDING,
  calculateDiscount,
  getCurrentPaymentDate,
  sumPackageAmounts,
} from 'src/lib';

import { IndividualSubscribersService } from 'src/individual-subscribers/individual-subscribers.service';
import { FamilySubscribersService } from 'src/family-subscribers/family-subscribers.service';
import { CorporateSubscribersService } from 'src/corporate-subscribers/corporate-subscribers.service';
import { AllSubscribers } from './entities/all-subscribers.entity';
import { PremiumPayment } from './dto/premium-payment.dto';
import { Bank } from 'src/bank/entities/bank.entity';
import * as dayjs from 'dayjs';
import { StaffService } from 'src/staff/staff.service';

const PDFDocumentTable = require('pdfkit-table');

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

    private readonly agentService: StaffService,
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
        let phone = '';

        switch (d.subscriberType) {
          case SUBSCRIBERTYPE.Individual:
            subscriberDetails =
              await this.individualSubscriberService.findOneById(
                d.subscriberId,
              );
            phone = subscriberDetails.phoneOne;
            break;
          case SUBSCRIBERTYPE.Corporate:
            subscriberDetails =
              await this.corporateSubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            phone = subscriberDetails.contact;
            break;
          default:
            subscriberDetails =
              await this.familySubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            phone = subscriberDetails.contact;

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
          phone,
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

  private async findSubscriberPayments(id: number) {
    return this.paymentRepository.find({ where: { subscriberDbId: id } });
  }
  private async findSubscriberPaymentsWithDateRange(
    id: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { subscriberDbId: id };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    return this.paymentRepository.find({ where });
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

  // async updateAgent() {
  //   const subscribers =
  //     await this.individualSubscriberService.findAllWithoutPagination();

  //   for (const subscriber of subscribers) {
  //     await this.allSubscriberRepository.update(subscriber.id, {
  //       agentId: subscriber.agent.id,
  //     });
  //   }
  // }

  async findSubscriberBasicDetails(id: number) {
    return this.allSubscriberRepository.findOneBy({ id });
  }

  private async subscriberView(options: PaginationOptions) {
    // this.updateAgent()
    const newOptions = {
      order: [],
      routeName: options.routeName,
      path: options.path,
      query: options.query,
      filter: options?.filter,
    };
    const subscribers = await this.paginationService.paginate({
      ...newOptions,
      repository: this.allSubscriberRepository,
      // relations: ['bank'],
    });

    const newData = await Promise.all(
      subscribers.data.map(async (d: AllSubscribers) => {
        let amountDue: number = 0;
        let daysSinceLastPayment: number | null = null;
        let subscriberDetails: any;
        let paymentStatus: SUBSCRIBER_PAYMENT_STATUS;
        let currentPaymentDate: string | null = null;
        let subscriberStatus: string | null = null;
        let phone = '';

        switch (d.subscriberType) {
          case SUBSCRIBERTYPE.Individual:
            subscriberDetails =
              await this.individualSubscriberService.findOneById(
                d.subscriberId,
              );
            phone = subscriberDetails.phoneOne;

            break;
          case SUBSCRIBERTYPE.Corporate:
            subscriberDetails =
              await this.corporateSubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            phone = subscriberDetails.contact;

            break;
          default:
            subscriberDetails =
              await this.familySubscriberService.findOneWithRelations(
                d.subscriberId,
              );
            phone = subscriberDetails.contact;

            break;
        }
        const payments = await this.findSubscriberPaymentsWithDateRange(
          d.subscriberId,
          options?.dateRange?.startDate,
          options?.dateRange?.endDate,
        );

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
            currentPaymentDate = dayjs(
              currentPayment.currentPaymentDate,
            ).format('ddd DD MMM, YYYY');
            subscriberStatus = currentPayment.status;
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
          currentPaymentDate,
          subscriberStatus,
          phone,
        };
      }),
    );
    return {
      ...subscribers,
      data: newData,
    };
  }

  async subscriberViewReport(options: PaginationOptions): Promise<Buffer> {
    let agentName = '';
    if (options?.filter?.agentId) {
      const agent = await this.agentService.findByID(options?.filter?.agentId);
      agentName = `${agent.firstName} ${
        agent.otherNames && agent.otherNames !== 'none' ? agent.otherNames : ''
      } ${agent.lastName}`;
    }
    const pdfBuffer: Buffer = await new Promise(async (resolve) => {
      const doc = new PDFDocumentTable({
        size: 'A4',
        bufferPages: true,
        margin: 30,
      });
      let pageNumber = 0;
      doc.on('pageAdded', () => {
        pageNumber++;

        let bottom = doc.page.margins.bottom;

        doc.page.margins.bottom = 0;
        doc.text('Pag.' + pageNumber, (doc.page.width - 100) * 0.5),
          doc.page.height - 50,
          {
            width: 100,
            align: 'center',
            lineBreak: true,
          };
        doc.page.margins.bottom = bottom;
      });
      doc.image('src/assets/logo.png', { fit: [100, 100], align: 'center' });
      doc
        .text(dayjs(new Date()).format('ddd DD MMMM, YYYY'), {
          align: 'right',
        })
        .moveTo(1, 1);
      // console.log(new Date())
      doc
        .font('Helvetica')
        .fontSize(18)
        .text('FASTCARE CLINICS', { align: 'center' });
      doc.moveDown();

      const subscribers = await this.subscriberView(options);
      // if (!subscribers.data.length) {
      //   throw new BadRequestException('No subscribers found');
      // }
      const newSubscribers =
        subscribers.data.length > 0
          ? subscribers.data.map((e, i) => ({
              // id: e.id,
              count: i + 1,
              name: e.name,
              membershipID: e.membershipID,
              subscriberType: e.subscriberType,
              dlsp: e.daysSinceLastPayment,
              currentPaymentDate: e.currentPaymentDate,
              subscriberStatus: e.subscriberStatus,
            }))
          : [];
      const headers =
        newSubscribers.length > 0 ? Object.keys(newSubscribers[0]) : [];

      const rows =
        newSubscribers.length > 0
          ? newSubscribers.map((subscriber) =>
              headers.map((header) =>
                typeof subscriber[header] === 'number'
                  ? String(subscriber[header])
                  : subscriber[header] !== null
                    ? subscriber[header]
                    : '',
              ),
            )
          : [];
      const table = {
        headers: [
          '#',
          'Name',
          'Membership ID',
          'Type',
          'DLSP',
          'LPD',
          'Status',
        ],
        rows,
      };
      doc.font('Helvetica').fontSize(14).text('SUBSCRIBER-VIEW REPORT', {
        align: 'center',
        underline: true,
      });
      doc.moveDown();
      doc
        .font('Helvetica')
        .fontSize(12)
        .text(
          `Start Date: ${
            options?.dateRange?.startDate
              ? dayjs(options?.dateRange?.startDate).format('ddd DD MMMM, YYYY')
              : 'N/A'
          }`,
          {
            align: 'left',
          },
        )
        .moveUp(1);

      doc
        .font('Helvetica')
        .fontSize(12)
        .text(
          `End Date: ${
            options?.dateRange?.endDate
              ? dayjs(options?.dateRange?.endDate).format('ddd DD MMMM, YYYY')
              : 'N/A'
          }`,
          {
            align: 'right',
          },
        );
      doc.moveDown();
      if (agentName)
        doc.font('Helvetica').fontSize(12).text(`Agent: ${agentName}`, {
          align: 'left',
        });
      // .moveUp(1);
      doc.moveDown();

      doc.table(table, {
        columnSpacing: 4,
        padding: 4,
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font('Helvetica').fontSize(8);
          indexColumn === 0 &&
            doc.addBackground(
              rectRow,
              row[6] === SUBSCRIBER_STANDING.good
                ? 'green'
                : row[6] === SUBSCRIBER_STANDING.default
                  ? 'blue'
                  : row[6] === SUBSCRIBER_STANDING.inactive
                    ? 'red'
                    : '',
              0.15,
            );
        },
      });

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.end();
    });
    return pdfBuffer;
  }
}
