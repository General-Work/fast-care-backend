import { Injectable } from '@nestjs/common';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { UpdateMandateDto } from './dto/update-mandate.dto';

@Injectable()
export class MandateService {
  create(createMandateDto: CreateMandateDto) {
    return 'This action adds a new mandate';
  }

  findAll() {
    return `This action returns all mandate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mandate`;
  }

  update(id: number, updateMandateDto: UpdateMandateDto) {
    return `This action updates a #${id} mandate`;
  }

  remove(id: number) {
    return `This action removes a #${id} mandate`;
  }
}
