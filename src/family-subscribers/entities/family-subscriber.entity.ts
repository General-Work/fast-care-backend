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

  @Column()
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

  @ManyToOne(() => Staff, (staff) => staff.individualSubscribers, {
    cascade: true,
    nullable: false,
  })
  agent: Staff;

  @OneToOne(
    () => FamilyPackage,
    (familyPackage) => familyPackage.familySubscriber,
    {
      nullable: true,
      eager: true,
      cascade: true,
    },
  )
  familyPackage: FamilyPackage;

  @OneToMany(
    () => FamilyBeneficiaries,
    (beneficiary) => beneficiary.familySubscriber,
    {
      eager: true,
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
