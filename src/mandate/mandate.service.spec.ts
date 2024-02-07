import { Test, TestingModule } from '@nestjs/testing';
import { MandateService } from './mandate.service';

describe('MandateService', () => {
  let service: MandateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MandateService],
    }).compile();

    service = module.get<MandateService>(MandateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
