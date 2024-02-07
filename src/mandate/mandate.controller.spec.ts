import { Test, TestingModule } from '@nestjs/testing';
import { MandateController } from './mandate.controller';
import { MandateService } from './mandate.service';

describe('MandateController', () => {
  let controller: MandateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MandateController],
      providers: [MandateService],
    }).compile();

    controller = module.get<MandateController>(MandateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
