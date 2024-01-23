import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IndividualSubscriberPayment } from 'src/individual-subscribers/entities/individual-subscriber-payment.entity';
import { Repository } from 'typeorm';
import { PaginationService } from 'src/pagination/pagination.service';
import { CorporateSubscriberPayment } from 'src/corporate-subscribers/entities/corporate-payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(CorporateSubscriberPayment)
    private readonly paymentRepository: Repository<CorporateSubscriberPayment>,
    private readonly paginationService: PaginationService,
  ) {}
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return this.paymentRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
