import { CorporatePackage } from 'src/corporate-subscribers/entities/corporate-package.entity';
import { FamilyPackage } from 'src/family-subscribers/entities/family-package.entity';
import { IndividualSubscriber } from 'src/individual-subscribers/entities/individual-subscriber.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => IndividualSubscriber, (subscriber) => subscriber.bank)
  individualSubscribers: IndividualSubscriber[];

  @OneToMany(() => FamilyPackage, (subscriber) => subscriber.bank)
  familySubscribers: FamilyPackage[];

  @OneToMany(() => CorporatePackage, (subscriber) => subscriber.bank)
  corporateSubscribers: CorporatePackage[];

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
