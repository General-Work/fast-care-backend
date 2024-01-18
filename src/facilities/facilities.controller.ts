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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';

@ApiTags('Facilities')
@UseGuards(JwtGuard)
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Facility has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createFacilityDto: CreateFacilityDto, createdBy: string) {
    return this.facilitiesService.create(createFacilityDto, createdBy);
  }

  @Get()
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
    description: 'Search by name',
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
      const result = await this.facilitiesService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
    updatedBy: string,
  ) {
    return this.facilitiesService.update(+id, updateFacilityDto, updatedBy);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(+id);
  }
}
