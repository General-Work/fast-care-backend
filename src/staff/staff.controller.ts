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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';

@ApiTags('Staff')
@UseGuards(JwtGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Staff has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createStaffDto: CreateStaffDto, createdBy: string) {
    return this.staffService.create(createStaffDto, createdBy);
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
    name: 'staffCode',
    required: false,
    type: String,
    description: 'Search staff Code',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    type: String,
    description: 'Search last Name',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    type: String,
    description: 'Search first Name',
  })
  @ApiQuery({
    name: 'orderByLastName',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by last name',
  })
  @ApiQuery({
    name: 'orderByFirstName',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by first name',
  })
  @ApiQuery({
    name: 'orderByStaffCode',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by staff code',
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
    @Query('staffCode') query: string,
    @Query('lastName') lastName: string,
    @Query('firstName') firstName: string,
    @Query('orderByLastName') sortLastName: OrderDirection,
    @Query('orderByFirstName') sortFirstName: OrderDirection,
    @Query('orderByStaffCode') sortStaffCode: OrderDirection,

    @Query('orderByDateCreated') createdAt: OrderDirection,
  ) {
    const options = {
      page,
      pageSize,
      filter: { staffCode: query, lastName, firstName },
      order: [
        { column: 'lastName', direction: sortLastName },
        { column: 'firstName', direction: sortFirstName },
        { column: 'staffCode', direction: sortStaffCode },
        { column: 'createdAt', direction: createdAt },
      ],
    };

    try {
      const result = await this.staffService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findByID(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    updatedBy: string,
  ) {
    return this.staffService.update(+id, updateStaffDto, updatedBy);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }
}
