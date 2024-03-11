import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CancelMandateDtoDto } from './dto/cancel-mandate.dto';
import {
  IPayment,
  MANDATESTATUS,
  PAYMENTMODE,
  PAYMENTSTATUS,
  PaymentRespose,
  SUBSCRIBERTYPE,
  SUBSCRIBER_CODES,
  cancelMandate,
  cancelPreapproval,
  readMandateStatusForMomoNumber,
  readMandatesForAMomoNumber,
  sendSMS,
} from 'src/lib';
import { CancelApprovalDto } from './dto/cancel-approval.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { IndividualSubscribersService } from 'src/individual-subscribers/individual-subscribers.service';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { TransactionDto } from './dto/create-debit.dto';
import { PaymentsService } from 'src/payments/payments.service';
import { FamilySubscribersService } from 'src/family-subscribers/family-subscribers.service';
import { CorporateSubscribersService } from 'src/corporate-subscribers/corporate-subscribers.service';

@Injectable()
export class MandateService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly individualSubscriberService: IndividualSubscribersService,
    private readonly familySubscriberService: FamilySubscribersService,
    private readonly corporateSubscriberService: CorporateSubscribersService,
    private readonly paymentService: PaymentsService,
  ) {}

  // TODO: update this so it work for family and corporate
  async createMandate(data: CreateMandateDto) {
    const {
      responseCode,
      responseMessage,
      clientPhone,
      thirdPartyReferenceNo,
      mandateId,
    } = data;

    let mandateStatus, success;
    if (
      responseCode === '01' ||
      responseMessage === 'Mandate creation successful'
    ) {
      mandateStatus = MANDATESTATUS.Success;
      success = true;
    } else if (
      responseCode === '113' ||
      responseMessage === 'User pre-approval failed'
    ) {
      mandateStatus = MANDATESTATUS.Failed;
      success = false;
    } else {
      throw new BadRequestException();
    }

    let service;
    if (thirdPartyReferenceNo.startsWith(SUBSCRIBER_CODES.Individual)) {
      service = this.individualSubscriberService;
    } else if (thirdPartyReferenceNo.startsWith(SUBSCRIBER_CODES.Family)) {
      service = this.familySubscriberService;
    } else {
      service = this.corporateSubscriberService;
    }

    await service.updateMandateStatus({
      momoNumber: clientPhone,
      referenceCode: thirdPartyReferenceNo,
      mandateID: mandateId,
      mandateStatus,
      success,
    });

    return {
      code: success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message: success ? 'Mandate successful' : 'User pre-approval failed',
    };
  }

  async cancelMandate(data: CancelMandateDtoDto): Promise<PaymentRespose> {
    const { clientPhone, thirdPartyReferenceNo, mandateId } = data;
    try {
      const res = await cancelMandate({ clientPhone, mandateId });

      if (res.responseCode !== '01') return res;

      await cancelPreapproval(clientPhone);

      const content = `Your FastCare Subscription has been Cancelled. Your subscription is no more active. You will NOT be debited from today (${new Date()
        .toISOString()
        .slice(0, 10)}) onwards. Contact customer care at (${
        process.env.CUSTOMER_CARE_NO
      }) for queries if any. ⁠
      `;

      await sendSMS({ clientPhone: clientPhone, content: content });

      let service;
      if (thirdPartyReferenceNo.startsWith(SUBSCRIBER_CODES.Individual)) {
        service = this.individualSubscriberService;
      } else if (thirdPartyReferenceNo.startsWith(SUBSCRIBER_CODES.Family)) {
        service = this.familySubscriberService;
      } else {
        service = this.corporateSubscriberService;
      }

      await service.updateMandateStatus({
        momoNumber: clientPhone,
        referenceCode: thirdPartyReferenceNo,
        mandateID: mandateId,
        mandateStatus: MANDATESTATUS.Cancelled,
        success: true,
      });

      return { responseCode: '01', responseMessage: 'Cancelled Mandate' };
    } catch (error) {
      return error;
    }
  }

  async cancelPreapproval(data: CancelApprovalDto) {
    try {
      const res = await cancelPreapproval(data.clientPhone);
      return res;
    } catch (e) {
      return e;
    }
  }

  async readMandateStatusForMomoNumber(momoNumber: string) {
    try {
      const res = await readMandateStatusForMomoNumber(momoNumber);
      return res;
    } catch (e) {
      return e;
    }
  }

  async getMandatesForAMomoNumber(momoNumber: string) {
    try {
      const res = await readMandatesForAMomoNumber(momoNumber);
      return res;
    } catch (e) {
      return e;
    }
  }

  async postDebit(data: TransactionDto) {
    const { thirdPartyReferenceNo } = data;
    const subscriberType = thirdPartyReferenceNo.startsWith(
      SUBSCRIBER_CODES.Individual,
    )
      ? SUBSCRIBERTYPE.Individual
      : thirdPartyReferenceNo.startsWith(SUBSCRIBER_CODES.Family)
        ? SUBSCRIBERTYPE.Family
        : SUBSCRIBERTYPE.Corporate;
    const subscriber =
      await this.individualSubscriberService.findIndividualWithoutPassportByReferenceCode(
        thirdPartyReferenceNo,
      );

    const subscriberName = `${subscriber.firstName} ${
      subscriber.otherNames ?? ''
    } ${subscriber.lastName}`;
    const x: IPayment = {
      dateOfPayment: new Date(),
      confirmed: true,
      confirmedBy: 'Payment Gateway',
      confirmedDate: new Date(),
      paymentStatus: PAYMENTSTATUS.Paid,
      paymentMode: PAYMENTMODE.MOMO,
      amountWithOutDiscount: subscriber.payments[0].originalAmount,
      amount: +data.amount,
      subscriberType: subscriberType,
      subscriberDbId: subscriber.id,
      subscriberPaymentDbId: subscriber.payments[0].id,
      paymentReferenceCode: thirdPartyReferenceNo,
      subscriberName: subscriberName,
      momTransactionId: data.momTransactionId,
      debitOrderTransactionId: data.debitOrderTransactionId,
      mandateId: data.mandateId,
      phoneNumber: data.clientPhone,
    };
    return this.paymentService.makePayment(x);
  }
}
