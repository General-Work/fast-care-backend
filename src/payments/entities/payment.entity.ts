import { PAYMENTMODE, PAYMENTSTATUS, SUBSCRIBERTYPE } from 'src/lib';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dateOfPayment: Date;

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

  @Column({ nullable: true })
  amountWithOutDiscount: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
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
}
