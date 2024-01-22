import { Test, TestingModule } from '@nestjs/testing';
import { IndividualSubscribersService } from './individual-subscribers.service';

describe('IndividualSubscribersService', () => {
  let service: IndividualSubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndividualSubscribersService],
    }).compile();

    service = module.get<IndividualSubscribersService>(IndividualSubscribersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
