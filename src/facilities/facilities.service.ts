import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(data: CreateFacilityDto, createdBy: string) {
    const facility = new Facility();
    facility.name = data.name;
    facility.phoneNumber = data.phoneNumber;
    facility.address = data.address;
    facility.gpsAdress = data.gpsAddress;
    facility.createdBy = createdBy;

    try {
      await this.facilityRepository.save(facility);

      return {
        message: 'Facility has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('Facility with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    const filterConditions = options.filter?.name ? options.filter : {};
    let order = [];
    if (options.order[0].direction) order.push(options.order[0]);
    if (options.order[1].direction) order.push(options.order[1]);

    return this.paginationService.paginate({
      ...options,
      order: order,
      filter: filterConditions,
      repository: this.facilityRepository,
    });
  }

  async findOne(id: number) {
    const facility = await this.facilityRepository.findOneBy({ id });

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found.`);
    }

    return facility;
  }

  async update(id: number, data: UpdateFacilityDto, updatedBy: string) {
    const facility = await this.findOne(id);

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    facility.name = data.name;
    facility.phoneNumber = data.phoneNumber;
    facility.gpsAdress = data.gpsAddress;
    facility.address = data.address;

    facility.updatedBy = updatedBy;
    facility.updatedAt = new Date();

    await this.facilityRepository.save(facility);

    return {
      message: 'Facility updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const facility = await this.findOne(id);

    await this.facilityRepository.remove(facility);

    return {
      message: 'Facility has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
