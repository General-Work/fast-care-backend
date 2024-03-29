import axios from 'axios';
import { FREQUENCY, MOMONETWORK } from './constants';
import * as dayjs from 'dayjs';

export interface PaymentRespose {
  responseCode: string;
  responseMessage: string;
}

export interface CreateManadateDto {
  momoNumber: string;
  amountToDebit: string;
  frequency: FREQUENCY;
  membershipId: string;
  momoNetWork: MOMONETWORK;
}

export interface ISMS {
  clientPhone: string;
  content: string;
}
export async function createMandate(
  data: CreateManadateDto,
): Promise<PaymentRespose> {
  try {
    const newData = {
      merchantId: process.env.PAYMENT_MERCHANTID,
      productId: process.env.PAYMENT_PRODUCTID,
      clientPhone: data.momoNumber,
      amountToDebit: data.amountToDebit,
      frequencyType: data.frequency,
      frequency: '1',
      startDate: dayjs(new Date()).format('YYYY-MM-DD'),
      endDate: dayjs(new Date()).add(20, 'year').format('YYYY-MM-DD'),
      debitDay: '15',
      apiKey: process.env.PAYMENT_MANDATEKEY,
      thirdPartyReferenceNo: data.membershipId,
      network: data.momoNetWork,
    };

    console.log(newData);

    const res = await axios.post(
      `${process.env.PAYMENT_URL}/create/mandate`,
      newData,
    );

    return res.data;
  } catch (e) {
    return e;
  }
}

export interface CancelMandateData {
  // merchantId: merchantId;
  // productId: string;
  clientPhone: string;
  mandateId: string;
  // apiKey: mandateKey;
}

export async function cancelMandate(
  data: CancelMandateData,
): Promise<PaymentRespose> {
  try {
    const res = await axios.post(`${process.env.PAYMENT_URL}/cancel/mandate`, {
      merchantId: process.env.PAYMENT_MERCHANTID,
      productId: process.env.PAYMENT_PRODUCTID,
      clientPhone: data.clientPhone,
      mandateId: data.mandateId,
      apiKey: process.env.PAYMENT_MANDATEKEY,
    });
    return res.data;
  } catch (e) {
    return e;
  }
}

export async function cancelPreapproval(
  clientPhone: string,
): Promise<PaymentRespose> {
  try {
    const res = await axios.post(
      `${process.env.PAYMENT_URL}/cancel/preapproval`,
      {
        merchantId: process.env.PAYMENT_MERCHANTID,
        productId: 1,
        clientPhone: clientPhone,
        apiKey: process.env.PAYMENT_MANDATEKEY,
      },
    );
    return res.data;
  } catch (e) {
    return e;
  }
}

export async function readMandateStatusForMomoNumber(momoNumber: string) {
  try {
    const res = await axios.get(
      `${process.env.PAYMENT_URL}/mandate/status/${momoNumber}`,
    );
    return res.data;
  } catch (e) {
    return e;
  }
}

export async function readMandatesForAMomoNumber(momoNumber: string) {
  try {
    const res = await axios.get(
      `${process.env.PAYMENT_URL}/retrieve-mandate/details/${momoNumber}/${process.env.PAYMENT_MERCHANTID}`,
    );
    return res.data;
  } catch (e) {
    return e;
  }
}

export async function sendSMS(data: ISMS) {
  try {
    const res = await axios.get(
      `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&type=0&dlr=1&destination=${data.clientPhone}&source=${process.env.SMS_SENDER_ID}&message=${data.content}`,
    );
    return res.data;
  } catch (e) {
    return e;
  }
}
