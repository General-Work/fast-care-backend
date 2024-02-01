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
  Req,
} from '@nestjs/common';
import { StaffService, StaffSort } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { extractColumnAndDirection } from 'src/lib';

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
  create(@Body() createStaffDto: CreateStaffDto, @Req() req) {
    return this.staffService.create(createStaffDto, req.userDetails.user);
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: StaffSort,
    description: 'Order by column',
    example: StaffSort.firstName_asc,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('sort') sort: StaffSort,
    @Req() req,
  ) {
    const routeName = `${req.protocol}://${req.get('host')}${req.path}`;

    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
      order: [],
      routeName,
    };

    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
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
    @Req() req,
  ) {
    return this.staffService.update(+id, updateStaffDto, req.userDetails.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(+id);
  }
}
