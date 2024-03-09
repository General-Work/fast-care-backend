import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib';
import { Request } from 'express';
import { PremiumPayment } from './dto/premium-payment.dto';
import { PaginationOptions } from 'src/pagination/pagination.service';

enum IPAYMENT_SORT {
  id_asc = 'id_asc',
  id_desc = 'id_desc',
  paymentStatus_asc = 'paymentStatus_asc',
  paymentStatus_desc = 'paymentStatus_desc',
  dateOfPayment_asc = 'dateOfPayment_asc',
  dateOfPayment_desc = 'dateOfPayment_desc',
  paymentMode_asc = 'paymentMode_asc',
  paymentMode_desc = 'paymentMode_desc',
}

enum PAYMENT_FILTER {
  confirmed_true = 'confirmed_true',
  confirmed_false = 'confirmed_false',
  agentId = 'agentId',
}

enum ISUBSCRIBER_SORT {
  id_asc = 'id_asc',
  id_desc = 'id_desc',
  subscriberType_asc = 'subscriberType_asc',
  subscriberType_desc = 'subscriberType_desc',
  status_asc = 'status_asc',
  status_desc = 'status_desc',
}
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
    enum: IPAYMENT_SORT,
    description: 'Order by column',
    example: IPAYMENT_SORT.id_asc,
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: Number,
    description: 'Agent ID',
  })
  @ApiQuery({
    name: 'confirmed',
    required: false,
    type: Boolean,
    description: 'Filter confirmed',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter startDate',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter endDate',
  })
  // @ApiQuery({
  //   name: 'filter',
  //   required: false,
  //   enum: PAYMENT_FILTER,
  //   description: 'Filter payment by these',
  // })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('confirmed') confirmed: string,
    @Query('agentId') agentId: string,
    @Query('sort') sort: IPAYMENT_SORT,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);

    const filter =
      confirmed && confirmed === 'true'
        ? true
        : confirmed === 'false'
          ? false
          : undefined;

    const agent = agentId ? +agentId : undefined;

    const filters = [];

    if (agent !== undefined) {
      filters.push({ agentId: agent });
    }

    if (filter !== undefined) {
      filters.push({ confirmed: filter });
    }

    const options: any = {
      page,
      pageSize,
      search: query ?? '',
      filter: filters.length ? Object.assign({}, ...filters) : {},
      order: [],
      routeName: paginate.routeName,
      path: paginate.path,
      query: paginate.query,
    };
    if (startDate) {
      options.dateRange = {
        startDate,
        endDate: endDate ? endDate : new Date(),
      };
    }

    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      const result = await this.paymentsService.findAll(options);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('all-subscribers')
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
    type: Date,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ISUBSCRIBER_SORT,
    description: 'Order by column',
    example: ISUBSCRIBER_SORT.id_desc,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllSubscribers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('sort') sort: ISUBSCRIBER_SORT,
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
      const result =
        await this.paymentsService.fetchSubscribersAllSubscribers(options);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('premium-payment')
  async makePremiumPayment(@Body() data: PremiumPayment, @Req() req: Request) {
    return this.paymentsService.makePremiumPayment(
      data,
      req.userDetails.user,
      req.userDetails.staffDbId,
    );
  }

  @Patch('confirm-payment/:id')
  confirmPayment(@Param('id') id: string, @Req() req: Request) {
    return this.paymentsService.confirmPayment(+id, req.userDetails.user);
  }
  // @Post('updateCreatedAt')
  // async updateCreatedAtToPaymentDate(): Promise<string> {
  //   try {
  //     await this.paymentsService.updateCreatedAtToPaymentDate();
  //     return 'createdAt fields updated successfully.';
  //   } catch (error) {
  //     // Handle error appropriately
  //     console.error('Error occurred while updating createdAt:', error);
  //     throw new Error('Failed to update createdAt fields.');
  //   }
  // }
}
