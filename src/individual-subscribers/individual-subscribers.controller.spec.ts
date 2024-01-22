import { Test, TestingModule } from '@nestjs/testing';
import { IndividualSubscribersController } from './individual-subscribers.controller';
import { IndividualSubscribersService } from './individual-subscribers.service';

describe('IndividualSubscribersController', () => {
  let controller: IndividualSubscribersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndividualSubscribersController],
      providers: [IndividualSubscribersService],
    }).compile();

    controller = module.get<IndividualSubscribersController>(IndividualSubscribersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
