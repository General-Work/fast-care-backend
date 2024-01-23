import { Test, TestingModule } from '@nestjs/testing';
import { CorporateSubscribersService } from './corporate-subscribers.service';

describe('CorporateSubscribersService', () => {
  let service: CorporateSubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateSubscribersService],
    }).compile();

    service = module.get<CorporateSubscribersService>(CorporateSubscribersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
