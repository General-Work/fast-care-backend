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
import { PaginationService } from 'src/pagination/pagination.service';
import { MailService } from 'src/mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';

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

    try {
      const res = await this.userRepository.save(user);
      await this.mailService.sendMail(
        res.username,
        'Welcome to Fastcare Clinics! Your Default Password',
        `Your cannot is successfully created.
        Your default password is: ${password}`,
      );
      return {
        message: 'User has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('User with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  findAll() {
    return this.userRepository.find();
  }
  async findOneById(id: number) {
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async changePassword(data: ChangePasswordDto, updatedBy: string) {
    const user = await this.findOneById(data.id);

    const passwordsMatch = user.passwordResetRequired
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
