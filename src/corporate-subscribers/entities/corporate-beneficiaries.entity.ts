import { Facility } from 'src/facilities/entities/facility.entity';
import { Package } from 'src/packages/entities/package.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CorporateSubscriber } from './corporate-subscriber.entity';

@Entity('corportate_beneficiaries')
export class CorporateBeneficiaries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dateOfBirth: string;

  @Column()
  contact: string;

  @ManyToOne(() => Facility, {eager:true, nullable: false })
  facility: Facility;

  @ManyToOne(() => Package, {eager:true, nullable: false })
  package: Package;

  @ManyToOne(
    () => CorporateSubscriber,
    (familySubscriber) => familySubscriber.beneficiaries,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'corporateSubscriberId' })
  corporateSubscriber: CorporateSubscriber;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
