import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

export enum StaffSort {
  firstName_asc = 'firstName_asc',
  firstName_desc = 'firstName_desc',
  lastName_asc = 'lastName_asc',
  lastName_desc = 'lastName_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
  staffCode_asc = 'staffCode_asc',
  staffCode_desc = 'staffCode_desc',
  id_asc = 'id_asc',
  id_desc = 'id_desc',
}

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(data: CreateStaffDto, createdBy: string) {
    const staff = {
      ...data,
      createdBy,
      staffCode: await this.generateStaffCode(),
    };

    try {
      await this.staffRepository.save(staff);

      return {
        message: 'Staff has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException(
          'Staff with this details already exists. Confrim email ',
        );
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    return this.paginationService.paginate({
      ...options,
      repository: this.staffRepository,
    });
  }

  async findByID(id: number) {
    const staff = await this.staffRepository.findOneBy({ id });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found.`);
    }

    return staff;
  }

  async update(id: number, data: UpdateStaffDto, updatedBy: string) {
    let staff = await this.findByID(id);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    this.staffRepository.merge(staff, {
      ...data,
      updatedBy,
      updatedAt: new Date(),
    });

    await this.staffRepository.save(staff);

    return {
      message: 'Staff updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const staff = await this.findByID(id);

    await this.staffRepository.remove(staff);

    return {
      message: 'Staff has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
  private async generateStaffCode(): Promise<string> {
    const latestStaffCode = await this.staffRepository
      .createQueryBuilder('staff')
      .select('staff.staffCode')
      .orderBy(
        'CAST(SUBSTRING(staff.staffCode, 10, LEN(staff.staffCode)) AS INT)',
        'DESC',
      )
      .limit(1)
      .getRawOne();

    let latestUniqueNumber = 0;
    if (latestStaffCode && latestStaffCode.staff_staffCode) {
      const match = latestStaffCode.staff_staffCode.match(/\d+$/);
      latestUniqueNumber = match ? parseInt(match[0], 10) : 0;
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const uniqueNumber = Number(latestUniqueNumber.toString().slice(6)) + 1;
    return `FCC${year}${month}${day}${uniqueNumber
      .toString()
      .padStart(4, '0')}`;
  }
}
