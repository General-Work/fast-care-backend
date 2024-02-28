import { MANDATESTATUS, PAYMENTSTATUS } from 'src/lib';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CorporatePackage } from './corporate-package.entity';

@Entity('corportate_subscriber_payments')
export class CorporateSubscriberPayment {
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

  @Column()
  paymentStatus: PAYMENTSTATUS;

  @Column({ default: '' })
  referenceCode: string;

  @Column({ nullable: true, type: 'money' })
  originalAmount: number;

  @Column({ nullable: true, type: 'money' })
  amountToDebit: number;

  @Column({ nullable: true })
  mandateStatus: MANDATESTATUS;

  @Column({ default: '' })
  mandateID: string;

  @ManyToOne(() => CorporatePackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corporatePackageId' })
  corporatePackage: CorporatePackage;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  createdBy: string;
}
