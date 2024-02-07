import axios from 'axios';
import { FREQUENCY, MOMONETWORK } from './constants';

export interface CreateManadateDto {
  momoNumber: string;
  amountToDebit: string;
  frequency: FREQUENCY;
  membershipId: string;
  momoNetWork: MOMONETWORK;
}
export async function createMandate(data: CreateManadateDto) {
  try {
    console.log(data)
    const res = await axios.post(
      `https://sub.fastcareportal.com/api/api/mandate`,
      data,
    );

    return res;
  } catch (e) {
    return e;
  }
}
