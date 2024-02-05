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
import { FamilySubscriber } from './family-subscriber.entity';
import { FamilySubscriberPayment } from './family-subscriber-payment.entity';
import { Bank } from 'src/bank/entities/bank.entity';

@Entity('family_packages')
export class FamilyPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discount: DISCOUNT;

  @Column()
  paymentMode: PAYMENTMODE;

  @Column()
  amountToDebit: number;

  @Column()
  frequency: FREQUENCY;

  @Column({ nullable: true })
  momoNetwork: MOMONETWORK;

  @Column({ nullable: true })
  momoNumber: string;

  @Column({ default: '' })
  accountNumber: string;

  @Column({ default: '' })
  chequeNumber: string;

  @Column({ default: '' })
  CAGDStaffID: string;

  @OneToOne(() => FamilySubscriber, (family) => family.familyPackage)
  @JoinColumn({ name: 'familySubscriberId' })
  familySubscriber: FamilySubscriber;

  @OneToMany(() => FamilySubscriberPayment, (payment) => payment.familyPackage)
  payments: FamilySubscriberPayment[];

  @ManyToOne(() => Bank, (bank) => bank.familySubscribers, {
    eager: true,
    nullable: true,
  })
  bank: Bank;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updateBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
