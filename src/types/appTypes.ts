export type STAFFTITLE = 'Mr' | 'Mrs' | 'Miss' | 'Hon' | 'Dr' | 'Prof' | 'Rev';
export type STAFFGENDER = 'Male' | 'Female';
export type STAFFMARITALSTATUS = 'Married' | 'Single' | 'Divorced' | 'Widowed';
export type MOMONETWORK = 'MTN' | 'VODAFONE' | 'AIRTELTIGO';
export type FREQUENCY = 'Daily' | 'Monthly' | 'Weekly';
export type IDTYPES =
  | 'Voter ID'
  | 'ECOWAS Card'
  | 'Passport'
  | "Driver's License";
export type PAYMENTMODE = 'Cash' | 'MOMO' | 'Cheque';
export type IPERMISSION =
  | 'View_Dashboard'
  | 'Manage_Users'
  | 'View_Users'
  | 'Manage_Staff'
  | 'View_Staff'
  | 'Manage_Subscriptions'
  | 'View_Subscriptions'
  | 'Manage_Payment'
  | 'View_Payment'
  | 'Manage_Debit_OPS'
  | 'View_Debit_OPS'
  | 'View_Reports'
  | 'View_Settings'
  | 'Manage_Settings'
  | 'Manage_Call_Center';

export type PAYMENTSTATUS = 'Paid' | 'Unpaid';
