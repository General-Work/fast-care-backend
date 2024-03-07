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
  CorporateSort,
  CorporateSubscribersService,
} from './corporate-subscribers.service';
import { CreateCorporateSubscriberDto } from './dto/create-corporate-subscriber.dto';
import { UpdateCorporateSubscriberDto } from './dto/update-corporate-subscriber.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { Request } from 'express';
import { OrderDirection } from 'src/pagination/pagination.service';
import { CreateCorporateBeneficiaryDto } from './dto/create-corporate-beneficiaries.dto';
import { UpdateCorporateBeneficiaryDto } from './dto/update-corporate-beneficiary.dto';
import { CreateCorporatePackageDto } from './dto/create-corporate-package.dto';
import { UpdateCorporatePackageDto } from './dto/update-corporate-package.dto';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib';

@ApiTags('Corporate Subscribers')
// @UseGuards(JwtGuard)
@Controller('corporate-subscribers')
export class CorporateSubscribersController {
  constructor(
    private readonly corporateSubscribersService: CorporateSubscribersService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Subscriber has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createCorporateSubscriberDto: CreateCorporateSubscriberDto,
    @Req() req: Request,
  ) {
    return this.corporateSubscribersService.create(
      createCorporateSubscriberDto,
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
    enum: CorporateSort,
    description: 'Order by column',
    example: CorporateSort.name_asc,
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
    @Query('sort') sort: CorporateSort,
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
      const result = await this.corporateSubscribersService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corporateSubscribersService.findOneWithRelations(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCorporateSubscriberDto: UpdateCorporateSubscriberDto,
    @Req() req: Request,
  ) {
    return this.corporateSubscribersService.update(
      +id,
      updateCorporateSubscriberDto,
      req.userDetails.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corporateSubscribersService.remove(+id);
  }

  @Post('beneficiary')
  @ApiResponse({
    status: 201,
    description: 'Beneficiary has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  createBeneficiary(
    @Body() data: CreateCorporateBeneficiaryDto,
    @Req() req: Request,
  ) {
    return this.corporateSubscribersService.createBeneficiary(
      data,
      req.userDetails.user,
    );
  }

  @Patch('beneficiary/:id')
  updateBeneficiary(
    @Body() data: UpdateCorporateBeneficiaryDto,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.corporateSubscribersService.updateBeneficiary(
      +id,
      data,
      req.userDetails.user,
    );
  }

  @Delete('beneficiary/:id')
  removeBeneficiary(@Param('id') id: string) {
    return this.corporateSubscribersService.removeBeneficiary(+id);
  }

  @Get('beneficiaries/:id')
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  readBeneficaries(@Param('id') id: string) {
    return this.corporateSubscribersService.findAllByCorporateSubscriberBeneficiaries(
      +id,
    );
  }

  @Post('package')
  createPackage(@Body() data: CreateCorporatePackageDto, @Req() req: Request) {
    return this.corporateSubscribersService.createPackage(
      data,
      req.userDetails.user,
      req.userDetails.staffDbId,
      // req.userDetails.userId
    );
  }

  @Patch('package/:id')
  updatePackage(
    @Param('id') id: string,
    @Body() data: UpdateCorporatePackageDto,
    @Req() req: Request,
  ) {
    return this.corporateSubscribersService.updatePackage(
      +id,
      data,
      req.userDetails.user,
    );
  }

  @Get('corporate-package/:id')
  findFamilyPackage(@Param('id') id: string) {
    return this.corporateSubscribersService.findFamilyPacakge(+id);
  }
}
