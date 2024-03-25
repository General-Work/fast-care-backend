import { Injectable } from '@nestjs/common';
import { PaginationOptions } from 'src/pagination/pagination.service';

import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class ReportsService {
  constructor(private readonly paymentService: PaymentsService) {}

  async readSubscriberView(options: PaginationOptions) {
    return this.paymentService.subscriberViewReport(options);
  }
}
