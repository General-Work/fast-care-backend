import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CancelMandateDtoDto } from './dto/cancel-mandate.dto';
import {
  IPayment,
  MANDATESTATUS,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
  SUBSCRIBER_CODES,
  cancelMandate,
  cancelPreapproval,
} from 'src/lib';
import { CancelApprovalDto } from './dto/cancel-approval.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { IndividualSubscribersService } from 'src/individual-subscribers/individual-subscribers.service';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { TransactionDto } from './dto/create-debit.dto';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class MandateService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly individualSubscriberService: IndividualSubscribersService,
    private readonly paymentService: PaymentsService,
  ) {}

  async createMandate(data: CreateMandateDto) {
    if (
      data.responseCode === '01' ||
      data.responseMessage === 'Mandate creation successful'
    ) {
      await this.individualSubscriberService.updateMandateStatus({
        momoNumber: data.clientPhone,
        referenceCode: data.thirdPartyReferenceNo,
        mandateID: data.mandateId,
        mandateStatus: MANDATESTATUS.Success,
        success: true,
      });
      return {
        code: HttpStatus.OK,
        message: 'Mandate successful',
      };
    } else if (
      data.responseCode === '113' ||
      data.responseMessage === 'User pre-approval failed'
    ) {
      await this.individualSubscriberService.updateMandateStatus({
        momoNumber: data.clientPhone,
        referenceCode: data.thirdPartyReferenceNo,
        mandateID: data.mandateId,
        mandateStatus: MANDATESTATUS.Failed,
        success: false,
      });
      return {
        code: HttpStatus.BAD_REQUEST,
        message: 'User pre-approval failed',
      };
    } else {
      return new BadRequestException();
    }
  }

  async cancelMandate(data: CancelMandateDtoDto) {
    try {
      const res = await cancelMandate(data);
      return res;
    } catch (e) {
      return e;
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
