import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MandateService } from './mandate.service';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { TransactionDto } from './dto/create-debit.dto';
import { CancelMandateDtoDto } from './dto/cancel-mandate.dto';
import { CancelApprovalDto } from './dto/cancel-approval.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mandate')
@Controller('mandate')
export class MandateController {
  constructor(private readonly mandateService: MandateService) {}

  @Post('callback')
  postCallback(@Body() data: CreateMandateDto) {
    console.log('mandate', data);
    return this.mandateService.createMandate(data);
  }

  @Post('debit')
  postDebit(@Body() data: TransactionDto) {
    console.log('transaction', data);
    return this.mandateService.postDebit(data)
  }

  @Post('cancel/mandate')
  cancelMandate(@Body() data: CancelMandateDtoDto) {
    // console.log(data);
    return this.mandateService.cancelMandate(data);
  }

  @Post('cancel/preapproval')
  preapprovalMandate(@Body() data: CancelApprovalDto) {
    // console.log(data);
    return this.mandateService.cancelPreapproval(data);
  }
}
