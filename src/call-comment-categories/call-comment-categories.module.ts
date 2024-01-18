import { Module } from '@nestjs/common';
import { CallCommentCategoriesService } from './call-comment-categories.service';
import { CallCommentCategoriesController } from './call-comment-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallCommentCategory } from './entities/call-comment-category.entity';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([CallCommentCategory]), PaginationModule],
  controllers: [CallCommentCategoriesController],
  providers: [CallCommentCategoriesService],
})
export class CallCommentCategoriesModule {}
