import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CallCommentCategoriesService } from './call-comment-categories.service';
import { CreateCallCommentCategoryDto } from './dto/create-call-comment-category.dto';
import { UpdateCallCommentCategoryDto } from './dto/update-call-comment-category.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';

@ApiTags('Call Comment Categories')
@UseGuards(JwtGuard)
@Controller('call-comment-categories')
export class CallCommentCategoriesController {
  constructor(
    private readonly callCommentCategoriesService: CallCommentCategoriesService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createCallCommentCategoryDto: CreateCallCommentCategoryDto,
    createdBy: string,
  ) {
    return this.callCommentCategoriesService.create(
      createCallCommentCategoryDto,
      createdBy,
    );
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Search name',
  })
  @ApiQuery({
    name: 'orderByName',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by name',
  })
  @ApiQuery({
    name: 'orderByDateCreated',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by dateCreated',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') query: string,
    @Query('orderByName') name: OrderDirection,
    @Query('orderByDateCreated') createdAt: OrderDirection,
  ) {
    const options = {
      page,
      pageSize,
      filter: { name: query },
      order: [
        { column: 'name', direction: name },
        { column: 'createdAt', direction: createdAt },
      ],
    };

    try {
      const result = await this.callCommentCategoriesService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callCommentCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCallCommentCategoryDto: UpdateCallCommentCategoryDto,
    updatedBy: string,
  ) {
    return this.callCommentCategoriesService.update(
      +id,
      updateCallCommentCategoryDto,
      updatedBy,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callCommentCategoriesService.remove(+id);
  }
}
