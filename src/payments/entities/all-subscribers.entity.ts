import { Bank } from 'src/bank/entities/bank.entity';
import {
  DISCOUNT,
  FREQUENCY,
  MOMONETWORK,
  PAYMENTMODE,
  SUBSCRIBERTYPE,
  SUBSCRIBER_STATUS,
} from 'src/lib';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('all_subscribers')
export class AllSubscribers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  subscriberId: number;

  @Column()
  subscriberType: SUBSCRIBERTYPE;

  @Column({ default: '' })
  membershipID: string;

  @Column({ nullable: true })
  familyPackageId: number;

  @Column({ nullable: true })
  corporatePackageId: number;

  @Column({ nullable: true })
  individualPaymentId: number;

  @Column({ nullable: true })
  familyPaymentId: number;

  @Column({ nullable: true })
  corporatePaymentId: number;

  @Column()
  discount: DISCOUNT;

  @Column()
  paymentMode: PAYMENTMODE;

  @Column({ nullable: true, type: 'money' })
  amountToDebit: number;

  @Column({ nullable: true, type: 'money' })
  originalAmount: number;

  @Column()
  frequency: FREQUENCY;

  @Column({ nullable: true })
  momoNetwork: MOMONETWORK;

  @ManyToOne(() => Bank, { nullable: true })
  bank: Bank;

  @Column({ nullable: true })
  momoNumber: string;

  @Column({ default: '' })
  accountNumber: string;

  @Column({ default: '' })
  chequeNumber: string;

  @Column({ default: '' })
  CAGDStaffID: string;

  @Column({ nullable: true })
  paymentReferenceCode: string;

  @Column()
  status: SUBSCRIBER_STATUS;
}
