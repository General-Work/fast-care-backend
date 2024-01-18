import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IDTYPES,
  STAFFGENDER,
  STAFFMARITALSTATUS,
  STAFFTITLE,
} from 'src/types';
import { User } from 'src/users/entities/user.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  staffCode: string;

  @Column()
  title: STAFFTITLE;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  otherNames: string;

  @Column({ unique: true })
  email: string;

  @Column()
  gender: STAFFGENDER;

  @Column()
  phoneNumber: string;

  @Column()
  nationality: string;

  @Column()
  position: string;

  @Column()
  marritalStatus: STAFFMARITALSTATUS;

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
}
