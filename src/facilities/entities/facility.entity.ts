import { CorporateBeneficiaries } from 'src/corporate-subscribers/entities/corporate-beneficiaries.entity';
import { FamilyBeneficiaries } from 'src/family-subscribers/entities/family-beneficiaries.entity';
import { FamilySubscriber } from 'src/family-subscribers/entities/family-subscriber.entity';
import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  gpsAdress: string;

  @OneToMany(() => User, (user) => user.facility)
  users: User[];

  @OneToMany(() => IndividualSubscriber, (subscriber) => subscriber.facility)
  subscribers: IndividualSubscriber[];

  @OneToMany(() => FamilyBeneficiaries, (subscriber) => subscriber.facility)
  familyBeneficiaries: FamilyBeneficiaries[];

  @OneToMany(() => CorporateBeneficiaries, (subscriber) => subscriber.facility)
  corporateBeneficiaries: CorporateBeneficiaries[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
