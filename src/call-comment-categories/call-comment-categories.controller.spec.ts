import { Test, TestingModule } from '@nestjs/testing';
import { CallCommentCategoriesController } from './call-comment-categories.controller';
import { CallCommentCategoriesService } from './call-comment-categories.service';

describe('CallCommentCategoriesController', () => {
  let controller: CallCommentCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallCommentCategoriesController],
      providers: [CallCommentCategoriesService],
    }).compile();

    controller = module.get<CallCommentCategoriesController>(CallCommentCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
