import {
  HttpStatus,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

export enum GroupSort {
  name_asc = 'name_asc',
  name_desc = 'name_desc',
  createdAt_asc = 'createdAt_asc',
  createdAt_desc = 'createdAt_desc',
  id_asc = 'id_asc',
  id_desc = 'id_desc',
}

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createGroupDto: CreateGroupDto, createdBy: string) {
    const group = new Group();
    group.name = createGroupDto.name;
    group.createdBy = createdBy;

    try {
      await this.groupRepository.save(group);

      return {
        message: 'Group has been successfully created.',
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
      repository: this.groupRepository,
      routeName: options.routeName,
    });
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOneBy({ id });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found.`);
    }

    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto, updatedBy: string) {
    const group = await this.findOne(id);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    group.name = updateGroupDto.name;

    group.updatedBy = updatedBy;
    group.updatedAt = new Date();

    await this.groupRepository.save(group);

    return {
      message: 'Group updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const group = await this.findOne(id);

    await this.groupRepository.remove(group);

    return {
      message: 'Group has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
