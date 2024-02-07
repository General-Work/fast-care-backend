import { Module } from '@nestjs/common';
import { MandateService } from './mandate.service';
import { MandateController } from './mandate.controller';

@Module({
  controllers: [MandateController],
  providers: [MandateService],
})
export class MandateModule {}
