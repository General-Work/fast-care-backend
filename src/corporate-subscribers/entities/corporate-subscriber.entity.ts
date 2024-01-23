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
import { CorporatePackage } from './corporate-package.entity';
import { CorporateBeneficiaries } from './corporate-beneficiaries.entity';

@Entity('corporate_subscribers')
export class CorporateSubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  idNumber: string;

  @Column()
  corporateMembershipID: string;

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

  @ManyToOne(() => Staff, (staff) => staff.corporateSubscribers, {
    cascade: true,
    nullable: false,
  })
  agent: Staff;

  @OneToOne(
    () => CorporatePackage,
    (familyPackage) => familyPackage.corporateSubscriber,
    {
      nullable: true,
      eager: true,
      cascade: true,
    },
  )
  corporatePackage: CorporatePackage;

  @OneToMany(
    () => CorporateBeneficiaries,
    (beneficiary) => beneficiary.corporateSubscriber,
    {
      eager: true,
      cascade: true,
    },
  )
  beneficiaries: CorporateBeneficiaries[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
