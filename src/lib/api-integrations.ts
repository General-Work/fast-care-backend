import axios from 'axios';
import { FREQUENCY, MOMONETWORK } from './constants';

interface PaymentRespose {
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
export async function createMandate(
  data: CreateManadateDto,
): Promise<PaymentRespose> {
  try {
    // console.log(data);
    const res = await axios.post(
      `https://sub.fastcareportal.com/api/api/mandate`,
      data,
    );

    return res.data;
  } catch (e) {
    return e;
  }
}

export interface CancelMandateData {
  // merchantId: merchantId;
  productId: string;
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
      productId: data.productId,
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


