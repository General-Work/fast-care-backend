import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(data: CreatePackageDto, createdBy: string) {
    const packaged = new Package();
    packaged.name = data.name;
    packaged.amount = data.amount;
    packaged.description = data.description;
    packaged.createdBy = createdBy;

    try {
      await this.packageRepository.save(packaged);

      return {
        message: 'Package has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('Group with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    return this.paginationService.paginate({
      ...options,
      repository: this.packageRepository,
    });
  }

  async findOne(id: number) {
    const packaged = await this.packageRepository.findOneBy({ id });

    if (!packaged) {
      throw new NotFoundException(`Pacakge with ID ${id} not found.`);
    }

    return packaged;
  }

  async update(id: number, data: UpdatePackageDto, updatedBy: string) {
    const packaged = await this.findOne(id);

    if (!packaged) {
      throw new NotFoundException('package not found');
    }

    packaged.name = data.name;
    packaged.amount = data.amount;
    packaged.description = data.description;
    packaged.updatedBy = updatedBy;
    packaged.updatedAt = new Date();

    await this.packageRepository.save(packaged);

    return {
      message: 'Package updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const packaged = await this.findOne(id);

    await this.packageRepository.remove(packaged);

    return {
      message: 'Package has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
