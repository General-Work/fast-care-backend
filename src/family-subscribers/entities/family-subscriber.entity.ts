import { Staff } from 'src/staff/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyPackage } from './family-package.entity';
import { FamilyBeneficiaries } from './family-beneficiaries.entity';

@Entity('family_subscribers')
export class FamilySubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  familyMembershipID: string;

  @Column()
  address: string;

  @Column()
  contact: string;

  @Column()
  email: string;

  @Column()
  principalPerson: string;

  @Column()
  principalPersonPhone: string;

  @ManyToOne(() => Staff, (staff) => staff.familySubscribers, {
    cascade: true,
    nullable: false,
    eager: true
  })
  agent: Staff;

  @OneToOne(
    () => FamilyPackage,
    (familyPackage) => familyPackage.familySubscriber,
    {
      nullable: true,
      cascade: true,
    },
  )
  familyPackage: FamilyPackage;

  @OneToMany(
    () => FamilyBeneficiaries,
    (beneficiary) => beneficiary.familySubscriber,
    {
      cascade: true,
    },
  )
  beneficiaries: FamilyBeneficiaries[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
