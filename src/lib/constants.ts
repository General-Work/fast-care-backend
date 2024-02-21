export const PERMISSIONS = [
  'View_Dashboard',
  'Manage_Users',
  'View_Users',
  'Manage_Staff',
  'View_Staff',
  'Manage_Subscriptions',
  'View_Subscriptions',
  'Manage_Payment',
  'View_Payment',
  'Manage_Debit_OPS',
  'View_Debit_OPS',
  'View_Reports',
  'View_Settings',
  'Manage_Settings',
  'Manage_Call_Center',
];

export enum IDTYPES {
  Passport = 'Passport',
  ECOWASCard = 'ECOWAS Card',
  DriverLicense = 'Driver License',
  VoterId = 'Voter ID',
}

export enum GENDER {
  Male = 'Male',
  Female = 'Female',
}

export enum MARITALSTATUS {
  Married = 'Married',
  Single = 'Single',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
}

export enum PAYMENTMODE {
  Cash = 'Cash',
  MOMO = 'MOMO',
  Cheque = 'Cheque',
  StandingOrder = 'Standing Order',
  CAGD = 'CAGD',
}

export enum FREQUENCY {
  Daily = 'Daily',
  Monthly = 'Monthly',
  Weekly = 'Weekly',
}

export enum TITLE {
  Mr = 'Mr',
  Mrs = 'Mrs',
  Miss = 'Miss',
  Hon = 'Hon',
  Dr = 'Dr',
  Prof = 'Prof',
  Rev = 'Rev',
}

export enum MOMONETWORK {
  MTN = 'MTN',
  VODAFONE = 'VODAFONE',
  // AIRTELTIGO = 'AIRTELTIGO',
  None = '',
}

export enum PAYMENTSTATUS {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
}

export enum MANDATESTATUS {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  None = '',
}

export enum DISCOUNT {
  '0%' = 0,
  '5%' = 5,
  '10%' = 10,
  '15%' = 15,
  '20%' = 20,
  '25%' = 25,
}

export enum SUBSCRIBERTYPE {
  Individual = 'Individual',
  Family = 'Family',
  Corporate = 'Corporate',
}

export interface IPayment {
  dateOfPayment: Date;
  confirmed: boolean;
  confirmedBy: string;
  confirmedDate: Date | null;
  paymentStatus: PAYMENTSTATUS;
  paymentMode: PAYMENTMODE;
  amountWithOutDiscount: number;
  amount: number;
  subscriberType: SUBSCRIBERTYPE;
  subscriberDbId: number;
  subscriberPaymentDbId: number;
  paymentReferenceCode: string;
  subscriberName: string;
  momTransactionId: string | null;
  debitOrderTransactionId: string | null;
  mandateId: string | null;
  phoneNumber: string | null;
}

export enum SUBSCRIBER_CODES {
  Individual = 'INS',
  Family = 'FNS',
  Corporate = 'CNS'
}