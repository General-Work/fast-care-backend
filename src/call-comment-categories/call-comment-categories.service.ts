import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCallCommentCategoryDto } from './dto/create-call-comment-category.dto';
import { UpdateCallCommentCategoryDto } from './dto/update-call-comment-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CallCommentCategory } from './entities/call-comment-category.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  PaginationService,
} from 'src/pagination/pagination.service';

@Injectable()
export class CallCommentCategoriesService {
  constructor(
    @InjectRepository(CallCommentCategory)
    private readonly categoryRepository: Repository<CallCommentCategory>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(data: CreateCallCommentCategoryDto, createdBy: string) {
    const category = new CallCommentCategory();
    category.name = data.name;
    category.description = data.description;
    category.createdBy = createdBy;

    try {
      await this.categoryRepository.save(category);

      return {
        message: 'Call Comment Category has been successfully created.',
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
    const filterConditions = options.filter?.name ? options.filter : {};
    let order = [];
    if (options.order[0].direction) order.push(options.order[0]);
    if (options.order[1].direction) order.push(options.order[1]);

    return this.paginationService.paginate({
      ...options,
      order: order,
      filter: filterConditions,
      repository: this.categoryRepository,
      routeName: options.routeName,
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return category;
  }

  async update(
    id: number,
    data: UpdateCallCommentCategoryDto,
    updatedBy: string,
  ) {
    const category = await this.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    category.name = data.name;
    category.description = data.description;
    category.updatedBy = updatedBy;
    category.updatedAt = new Date();

    await this.categoryRepository.save(category);

    return {
      message: 'Call Comment Category updated successfully',
      status: HttpStatus.OK,
      success: true,
    };
  }

  async remove(id: number) {
    const group = await this.findOne(id);

    await this.categoryRepository.remove(group);

    return {
      message: 'Category has been successfully removed.',
      status: HttpStatus.OK,
      success: true,
    };
  }
}
