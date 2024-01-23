import { PAYMENTSTATUS } from 'src/lib';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyPackage } from './family-package.entity';

@Entity('family_subscriber_payments')
export class FamilySubscriberPayment {
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

  @ManyToOne(() => FamilyPackage, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyPackageId' })
  familyPackage: FamilyPackage;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  createdBy: string;
}
