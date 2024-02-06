import { Facility } from 'src/facilities/entities/facility.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @Column()
  active: boolean;

  @ManyToOne(() => Facility, (facility) => facility.users, {
    cascade: true,
    eager: true,
  })
  facility: Facility;

  @OneToOne(() => Staff, (staff) => staff.user, { cascade: true })
  staff: Staff;

  @Column({ default: false })
  passwordResetRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
