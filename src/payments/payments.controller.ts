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
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib';
import { Request } from 'express';

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
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('sort') sort: IPAYMENT_SORT,
    @Req() req: Request,
  ) {
    // return this.paymentsService.findAll();
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
      const result = await this.paymentsService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      // console.log('here', error)
      return { error: error.message };
    }
  }
}
