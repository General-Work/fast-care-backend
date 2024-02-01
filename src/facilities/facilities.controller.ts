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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDirection } from 'src/pagination/pagination.service';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { GroupSort } from 'src/groups/groups.service';
import { extractColumnAndDirection } from 'src/lib';

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
  create(@Body() createFacilityDto: CreateFacilityDto, @Req() req) {
    return this.facilitiesService.create(
      createFacilityDto,
      req.userDetails.user,
    );
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: GroupSort,
    description: 'Order by column',
    example: GroupSort.name_asc,
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
    @Query('sort') sort: GroupSort,
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
    @Req() req,
  ) {
    return this.facilitiesService.update(
      +id,
      updateFacilityDto,
      req.userDetails.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(+id);
  }
}
