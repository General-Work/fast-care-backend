import { CorporateBeneficiaries } from 'src/corporate-subscribers/entities/corporate-beneficiaries.entity';
import { FamilyBeneficiaries } from 'src/family-subscribers/entities/family-beneficiaries.entity';
import { FamilySubscriber } from 'src/family-subscribers/entities/family-subscriber.entity';
import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => IndividualSubscriber, (subscriber) => subscriber.package)
  subscribers: IndividualSubscriber[];

  @OneToMany(() => FamilyBeneficiaries, (subscriber) => subscriber.package)
  familyBeneficiaries: FamilyBeneficiaries[];

  @OneToMany(() => CorporateBeneficiaries, (subscriber) => subscriber.package)
  corporateBeneficiaries: CorporateBeneficiaries[];

  @Column({ type: 'money', default: '' })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
