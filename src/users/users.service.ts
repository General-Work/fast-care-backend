import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  comparePasswords,
  encodedPassword,
  generateDefaultPassword,
} from 'src/lib';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';

export enum UserSort {
  username_asc = 'username_asc',
  username_desc = 'username_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
  id_asc = 'id_asc',
  id_desc = 'id_desc',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginationService: PaginationService,
    private readonly mailService: MailService,
  ) {}

  async create(data: CreateUserDto, createBy: string) {
    const role = new Role();
    role.id = data.roleId;

    const facility = new Facility();
    facility.id = data.facilityId;

    const staff = new Staff();
    staff.id = data.staffDbId;

    const user = new User();
    const password = generateDefaultPassword();
    user.username = data.email;
    user.role = role;
    user.facility = facility;
    user.staff = staff;
    user.password = password;
    user.createdBy = createBy;
    user.passwordResetRequired = true;

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(User, user);

      const ret = await this.mailService.sendMail(
        data.email,
        'Welcome to Fastcare Clinics! Your Default Password',
        `Your account is successfully created. `,
        `<strong>Your default password is:</strong> ${password} <br/> <span>Don't forget to change this password after a successfully login to the system for the first time.</sapn>`,
      );

      if (ret) {
        await queryRunner.commitTransaction();

        return {
          message: 'User has been successfully created.',
          status: HttpStatus.CREATED,
          success: true,
        };
      } else {
        await queryRunner.rollbackTransaction();
        throw new Error('Email sending failed.');
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('User with this name already exists.');
      } else {
        throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    const res = await this.paginationService.paginate({
      ...options,
      repository: this.userRepository,
    });

    const d = {
      ...res,
      data: res.data
        ? res.data.map((x) => {
            const { password, ...dataWithoutPassword } = x;
            return dataWithoutPassword;
          })
        : [],
    };

    return d;
  }

  async findUser(id: number) {
    const res = await this.findOneById(id);
    const { password, ...data } = res;
    return data;
  }

  async findOneById(id: number) {
    // console.log(id);
    const group = await this.userRepository.findOneBy({ id });

    if (!group) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return group;
  }

  async findOneWithUsername(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['staff', 'facility', 'role'],
    });
  }

  async update(id: number, data: UpdateUserDto, updatedBy: string) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const role = new Role();
    role.id = data.roleId;

    const facility = new Facility();
    facility.id = data.facilityId;

    user.facility = facility;
    user.role = role;
    user.updatedBy = updatedBy;
    user.updatedAt = new Date();

    await this.userRepository.save(user);

    return {
      message: 'User updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async changePassword(data: ChangePasswordDto, id: number, updatedBy: string) {
    const user = await this.findOneById(id);
    // console.log(user)

    const passwordsMatch = !user.passwordResetRequired
      ? comparePasswords(data.oldPassword, user.password)
      : user.password === data.oldPassword;

    if (!passwordsMatch) {
      throw new BadRequestException('Passwords do not match');
    }

    user.password = encodedPassword(data.newPassword);
    user.passwordResetRequired = false;
    user.updatedBy = updatedBy;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Successfully changed password',
    };
  }

  async remove(id: number) {
    const user = await this.findOneById(id);

    await this.userRepository.remove(user);

    return {
      message: 'User has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
