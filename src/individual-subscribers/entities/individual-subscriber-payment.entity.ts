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
import { PAYMENTSTATUS } from 'src/lib';

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

  @Column()
  confirmedBy: string;

  @CreateDateColumn()
  confirmedDate: Date;

  @Column()
  paymentStatus: PAYMENTSTATUS;

  @ManyToOne(() => IndividualSubscriber, { eager: true, onDelete: 'CASCADE' })
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
