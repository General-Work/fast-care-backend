import { Test, TestingModule } from '@nestjs/testing';
import { FamilySubscribersController } from './family-subscribers.controller';
import { FamilySubscribersService } from './family-subscribers.service';

describe('FamilySubscribersController', () => {
  let controller: FamilySubscribersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilySubscribersController],
      providers: [FamilySubscribersService],
    }).compile();

    controller = module.get<FamilySubscribersController>(FamilySubscribersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
