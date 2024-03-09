import { Bank } from 'src/bank/entities/bank.entity';
import {
  MOMONETWORK,
  PAYMENTMODE,
  PAYMENTSTATUS,
  SUBSCRIBERTYPE,
} from 'src/lib';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dateOfPayment: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: '' })
  confirmedBy: string;

  @Column({ nullable: true })
  confirmedDate: Date;

  @Column()
  paymentStatus: PAYMENTSTATUS;

  @Column()
  paymentMode: PAYMENTMODE;

  @Column({ nullable: true, type: 'money' })
  amountWithOutDiscount: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'money', nullable: true })
  amount: number;

  @Column()
  subscriberType: SUBSCRIBERTYPE;

  @Column()
  subscriberDbId: number;

  @Column()
  subscriberPaymentDbId: number;

  @Column()
  paymentReferenceCode: string;

  @Column()
  subscriberName: string;

  @Column({ nullable: true })
  momTransactionId: string;

  @Column({ nullable: true })
  debitOrderTransactionId: string;

  @Column({ nullable: true })
  mandateId: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ default: '' })
  narration: string;

  @ManyToOne(() => Bank, { nullable: true })
  bank: Bank;

  @Column({ default: '' })
  chequeNumber: string;

  @Column({ default: '' })
  momoNumber: string;

  @Column({ default: '' })
  accountNumber: string;

  @Column({ default: '' })
  CAGDStaffID: string;

  @Column({ nullable: true, default: '' })
  momoNetwork: MOMONETWORK;

  @Column({ nullable: true })
  agentId: number;
}
