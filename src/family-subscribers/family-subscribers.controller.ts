import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  FamilySort,
  FamilySubscribersService,
} from './family-subscribers.service';
import { CreateFamilySubscriberDto } from './dto/create-family-subscriber.dto';
import { UpdateFamilySubscriberDto } from './dto/update-family-subscriber.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { Request } from 'express';
import { OrderDirection } from 'src/pagination/pagination.service';
import { CreateFamilyBeneficiaryDto } from './dto/create-family-beneficiary.dto';
import { UpdateFamilyBeneficiaryDto } from './dto/update-family-beneficiary.dto';
import { CreateFamilyPackageDto } from './dto/create-family-package.dto';
import { UpdateFamilyPackageDto } from './dto/update-family-package.dto';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib';

@ApiTags('Family Subscribers')
@UseGuards(JwtGuard)
@Controller('family-subscribers')
export class FamilySubscribersController {
  constructor(
    private readonly familySubscribersService: FamilySubscribersService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Subscriber has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createFamilySubscriberDto: CreateFamilySubscriberDto,
    @Req() req: Request,
  ) {
    return this.familySubscribersService.create(
      createFamilySubscriberDto,
      req.userDetails.user,
      req.userDetails.staffDbId,
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: FamilySort,
    description: 'Order by column',
    example: FamilySort.name_asc,
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
    @Query('sort') sort: FamilySort,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);
    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
      order: [],
      routeName: paginate.routeName,
      path: paginate.path,
      query: paginate.query,
    };

    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      const result = await this.familySubscribersService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familySubscribersService.findOneById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilySubscriberDto: UpdateFamilySubscriberDto,
    @Req() req: Request,
  ) {
    return this.familySubscribersService.update(
      +id,
      updateFamilySubscriberDto,
      req.userDetails.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familySubscribersService.remove(+id);
  }

  @Post('beneficiary')
  @ApiResponse({
    status: 201,
    description: 'Beneficiary has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  createBeneficiary(
    @Body() data: CreateFamilyBeneficiaryDto,
    @Req() req: Request,
  ) {
    return this.familySubscribersService.createBeneficiary(
      data,
      req.userDetails.user,
    );
  }

  @Patch('beneficiary/:id')
  updateBeneficiary(
    @Body() data: UpdateFamilyBeneficiaryDto,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.familySubscribersService.updateBeneficiary(
      +id,
      data,
      req.userDetails.user,
    );
  }

  @Delete('beneficiary/:id')
  removeBeneficiary(@Param('id') id: string) {
    return this.familySubscribersService.removeBeneficiary(+id);
  }

  @Get('beneficiaries/:id')
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  readBeneficaries(@Param('id') id: string) {
    return this.familySubscribersService.findAllByFamilySubscriberBeneficiaries(
      +id,
    );
  }

  @Post('package')
  createPackage(@Body() data: CreateFamilyPackageDto, @Req() req: Request) {
    return this.familySubscribersService.createPackage(
      data,
      req.userDetails.user,
    );
  }

  @Patch('package/:id')
  updatePackage(
    @Param('id') id: string,
    @Body() data: UpdateFamilyPackageDto,
    @Req() req: Request,
  ) {
    return this.familySubscribersService.updatePackage(
      +id,
      data,
      req.userDetails.user,
    );
  }

  @Get('family-package/:id')
  findFamilyPackage(@Param('id') id: string) {
    return this.familySubscribersService.findFamilyPacakge(+id);
  }
}
