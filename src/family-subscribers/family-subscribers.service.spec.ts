import { Test, TestingModule } from '@nestjs/testing';
import { FamilySubscribersService } from './family-subscribers.service';

describe('FamilySubscribersService', () => {
  let service: FamilySubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FamilySubscribersService],
    }).compile();

    service = module.get<FamilySubscribersService>(FamilySubscribersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
