import { Test, TestingModule } from '@nestjs/testing';
import { CorporateSubscribersController } from './corporate-subscribers.controller';
import { CorporateSubscribersService } from './corporate-subscribers.service';

describe('CorporateSubscribersController', () => {
  let controller: CorporateSubscribersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorporateSubscribersController],
      providers: [CorporateSubscribersService],
    }).compile();

    controller = module.get<CorporateSubscribersController>(CorporateSubscribersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
