import { Facility } from 'src/facilities/entities/facility.entity';
import { Package } from 'src/packages/entities/package.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FamilySubscriber } from './family-subscriber.entity';
import { FamilyPackage } from './family-package.entity';

@Entity('family_beneficiaries')
export class FamilyBeneficiaries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dateOfBirth: string;

  @Column()
  contact: string;

  @ManyToOne(() => Facility, { eager: true, nullable: false })
  facility: Facility;

  @ManyToOne(() => Package, { eager: true, nullable: false })
  package: Package;

  @ManyToOne(
    () => FamilySubscriber,
    (familySubscriber) => familySubscriber.beneficiaries,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'familySubscriberId' })
  familySubscriber: FamilySubscriber;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
