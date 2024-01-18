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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderBy, OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';

@ApiTags('Groups')
@UseGuards(JwtGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Group has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createGroupDto: CreateGroupDto, createdBy: string) {
    return this.groupsService.create(createGroupDto, createdBy);
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
      const result = await this.groupsService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    updatedBy: string,
  ) {
    return this.groupsService.update(+id, updateGroupDto, updatedBy);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
