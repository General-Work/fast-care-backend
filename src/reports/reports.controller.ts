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
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { getPaginationParams } from 'src/lib';
import { Request, Response } from 'express';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('subscriber-view')
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
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: Number,
    description: 'Agent ID',
  })
  async readSubscriberView(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('agentId') agentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const paginate = getPaginationParams(req);

    const agent = agentId ? +agentId : undefined;

    const filters = [];

    if (agent !== undefined) {
      filters.push({ agentId: agent });
    }

    const options: any = {
      order: [],
      routeName: paginate.routeName,
      filter: filters.length ? Object.assign({}, ...filters) : {},
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
      const ret = await this.reportsService.readSubscriberView(options);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-disposition': 'inline; filename=subscriberview.pdf',
        'Content-Length': ret.length,
      });

      // Send the PDF content to the client

      res.send(ret);
    } catch (e) {
      return { error: e.message };
    }
  }
}
