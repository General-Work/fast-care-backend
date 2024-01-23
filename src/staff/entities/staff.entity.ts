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
import { User } from 'src/users/entities/user.entity';
import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
import { GENDER, IDTYPES, MARITALSTATUS, TITLE } from 'src/lib';
import { FamilySubscriber } from 'src/family-subscribers/entities/family-subscriber.entity';
import { CorporateSubscriber } from 'src/corporate-subscribers/entities/corporate-subscriber.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  staffCode: string;

  @Column()
  title: TITLE;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  otherNames: string;

  @Column({ unique: true })
  email: string;

  @Column()
  gender: GENDER;

  @Column()
  phoneNumber: string;

  @Column()
  nationality: string;

  @Column()
  position: string;

  @Column()
  marritalStatus: MARITALSTATUS;

  @Column()
  idType: IDTYPES;

  @Column()
  idNumber: string;

  @Column()
  dateOfBirth: string;

  @OneToOne(() => User, (user) => user.staff, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @OneToMany(() => IndividualSubscriber, (subscriber) => subscriber.agent, {
    onDelete: 'SET NULL',
  })
  individualSubscribers: IndividualSubscriber[];

  @OneToMany(() => FamilySubscriber, (subscriber) => subscriber.agent, {
    onDelete: 'SET NULL',
  })
  familySubscribers: FamilySubscriber[];

  @OneToMany(() => CorporateSubscriber, (subscriber) => subscriber.agent, {
    onDelete: 'SET NULL',
  })
  corporateSubscribers: CorporateSubscriber[];
}
