import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyBeneficiaries } from './family-beneficiaries.entity';
import { DISCOUNT, FREQUENCY, MOMONETWORK, PAYMENTMODE } from 'src/lib';
import { FamilySubscriber } from './family-subscriber.entity';
import { FamilySubscriberPayment } from './family-subscriber-payment.entity';

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

  @OneToOne(() => FamilySubscriber, (family) => family.familyPackage)
  @JoinColumn({ name: 'familySubscriberId' })
  familySubscriber: FamilySubscriber;


  @OneToMany(() => FamilySubscriberPayment, (payment) => payment.familyPackage)
  payments: FamilySubscriberPayment[];

  @Column({nullable: true})
  createdBy:string

  @Column({nullable: true})
  updateBy:string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
