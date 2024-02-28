import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IndividualSubscriber } from './individual-subscriber.entity';
import { MANDATESTATUS, PAYMENTSTATUS } from 'src/lib';

@Entity('individual_subscriber_payments')
export class IndividualSubscriberPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  dateOfPayment: Date;

  @CreateDateColumn()
  dateOfSubscription: Date;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: '' })
  confirmedBy: string;

  @CreateDateColumn()
  confirmedDate: Date;

  @Column({ default: '' })
  referenceCode: string;

  @Column()
  paymentStatus: PAYMENTSTATUS;

  @Column({ nullable: true, type: 'money' })
  originalAmount: number;

  @Column({ nullable: true, type: 'money' })
  amountToDebit: number;

  @Column({ nullable: true })
  mandateStatus: MANDATESTATUS;

  @Column({ default: '' })
  mandateID: string;

  @ManyToOne(() => IndividualSubscriber, (x) => x.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscriberId' })
  subscriber: IndividualSubscriber;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  createdBy: string;
}
