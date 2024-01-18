import { Test, TestingModule } from '@nestjs/testing';
import { CallCommentCategoriesService } from './call-comment-categories.service';

describe('CallCommentCategoriesService', () => {
  let service: CallCommentCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CallCommentCategoriesService],
    }).compile();

    service = module.get<CallCommentCategoriesService>(CallCommentCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
