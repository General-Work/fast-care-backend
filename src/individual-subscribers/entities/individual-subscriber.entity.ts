import { Facility } from 'src/facilities/entities/facility.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Package } from 'src/packages/entities/package.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IndividualSubscriberPayment } from './individual-subscriber-payment.entity';
import {
  FREQUENCY,
  GENDER,
  IDTYPES,
  MARITALSTATUS,
  MOMONETWORK,
  PAYMENTMODE,
} from 'src/lib';

@Entity('individual_subscribers')
export class IndividualSubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idType: IDTYPES;

  @Column({ type: 'text', nullable: true })
  passportPicture: string;

  @Column({ unique: true })
  idNumber: string;

  @Column({ unique: true })
  membershipID: string;

  @Column()
  firstName: string;

  @Column()
  otherNames: string;

  @Column()
  lastName: string;

  @Column()
  dateOfBirth: string;

  @Column()
  gender: GENDER;

  @Column()
  occupation: string;

  @Column()
  maritalStatus: MARITALSTATUS;

  @Column()
  address: string;

  @Column()
  gpsAddress: string;

  @Column({ unique: true })
  phoneOne: string;

  @Column()
  phoneTwo: string;

  @Column()
  emergencyPerson: string;

  @Column()
  emergencyPersonPhone: string;

  @Column({ default: false })
  hasNHIS: boolean;

  @Column({ nullable: true, default: '' })
  NHISNumber: string;

  @Column()
  paymentMode: PAYMENTMODE;

  @Column()
  frequency: FREQUENCY;

  @Column()
  discount: string;

  @Column({ nullable: true })
  momoNetwork: MOMONETWORK;

  @Column({ nullable: true })
  momoNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @ManyToOne(() => Staff, (staff) => staff.individualSubscribers, {
    cascade: true,
    nullable: false,
  })
  agent: Staff;

  @ManyToOne(() => Facility, { eager: true, nullable: false })
  facility: Facility;

  @ManyToOne(() => Package, { eager: true, nullable: false })
  package: Package;

  @ManyToOne(() => Group, { eager: true, nullable: true })
  group: Group;

  @OneToMany(() => IndividualSubscriberPayment, (payment) => payment.subscriber)
  payments: IndividualSubscriberPayment[];
}
