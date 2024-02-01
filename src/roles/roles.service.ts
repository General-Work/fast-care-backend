import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(data: CreateRoleDto, createdBy: string) {
    const role = new Role();
    role.name = data.name;
    role.permissions = data.permissions;
    role.createdBy = createdBy;

    try {
      await this.roleRepository.save(role);

      return {
        message: 'Role has been successfully created.',
        status: HttpStatus.CREATED,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key')
      ) {
        throw new ConflictException('Role with this name already exists.');
      } else {
        throw error;
      }
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult> {
    return this.paginationService.paginate({
      ...options,
      repository: this.roleRepository,
    });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return role;
  }

  async update(id: number, data: UpdateRoleDto, updatedBy: string) {
    const role = await this.findOne(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.name = data.name;
    role.permissions = data.permissions;

    role.updatedBy = updatedBy;
    role.updatedAt = new Date();

    await this.roleRepository.save(role);

    return {
      message: 'ROle updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const role = await this.findOne(id);

    await this.roleRepository.remove(role);

    return {
      message: 'Role has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
