import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(data: CreateBankDto, createdBy: string) {
    const bank = new Bank();
    bank.name = data.name;
    bank.createdBy = createdBy;

    try {
      await this.bankRepository.save(bank);

      return {
        message: 'Bank has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('bank with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    return this.paginationService.paginate({
      ...options,
      repository: this.bankRepository,
      routeName: options.routeName,
    });
  }

  async findOne(id: number) {
    const bank = await this.bankRepository.findOneBy({ id });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found.`);
    }

    return bank;
  }

  async update(id: number, data: UpdateBankDto, updatedBy: string) {
    const bank = await this.findOne(id);

    if (!bank) {
      throw new NotFoundException('bank not found');
    }

    bank.name = data.name;

    bank.updatedBy = updatedBy;
    bank.updatedAt = new Date();

    await this.bankRepository.save(bank);

    return {
      message: 'bank updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const bank = await this.findOne(id);
    await this.bankRepository.remove(bank);
    return {
      message: 'bank has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
