import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DISCOUNT, FREQUENCY, MOMONETWORK, PAYMENTMODE } from 'src/lib';
import { CorporateSubscriber } from './corporate-subscriber.entity';
import { CorporateSubscriberPayment } from './corporate-payment.entity';
import { Bank } from 'src/bank/entities/bank.entity';

@Entity('corporate_packages')
export class CorporatePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discount: DISCOUNT;

  @Column()
  paymentMode: PAYMENTMODE;

  @Column({ default: '' })
  accountNumber: string;

  @Column({ default: '' })
  chequeNumber: string;

  @Column({ default: '' })
  CAGDStaffID: string;

  @ManyToOne(() => Bank, { eager: true, nullable: true })
  bank: Bank;

  @Column()
  amountToDebit: number;

  @Column()
  frequency: FREQUENCY;

  @Column({ nullable: true })
  momoNetwork: MOMONETWORK;

  @Column({ nullable: true })
  momoNumber: string;

  @OneToOne(() => CorporateSubscriber, (family) => family.corporatePackage)
  @JoinColumn({ name: 'corporateSubscriberId' })
  corporateSubscriber: CorporateSubscriber;

  @OneToMany(
    () => CorporateSubscriberPayment,
    (payment) => payment.corporatePackage,
  )
  payments: CorporateSubscriberPayment[];

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updateBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
