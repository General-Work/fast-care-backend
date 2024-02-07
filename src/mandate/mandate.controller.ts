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
import { UpdateMandateDto } from './dto/update-mandate.dto';

@Controller('mandate')
export class MandateController {
  constructor(private readonly mandateService: MandateService) {}

  @Post('callback')
  postCallback(@Body() data: CreateMandateDto) {
    console.log('mandate',data);
    return true;
  }

  @Post()
  create(@Body() createMandateDto: CreateMandateDto) {
    return this.mandateService.create(createMandateDto);
  }

  @Get()
  findAll() {
    return this.mandateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mandateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMandateDto: UpdateMandateDto) {
    return this.mandateService.update(+id, updateMandateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mandateService.remove(+id);
  }
}
