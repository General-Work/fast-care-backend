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

  @ManyToOne(() => Facility, (facility) => facility.familyBeneficiaries, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'facilityId' })
  facility: Facility;

  @ManyToOne(() => Package, (newPackage) => newPackage.familyBeneficiaries, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @ManyToOne(
    () => FamilySubscriber,
    (familySubscriber) => familySubscriber.beneficiaries,
    {
      onDelete: 'CASCADE',
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
