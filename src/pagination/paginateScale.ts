import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

export interface PaginationOptions {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  where?: Record<string, any>;
  order?: { [key: string]: 'ASC' | 'DESC' }[];
  repository?: Repository<any>;
}

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  totalCount: number;
}

export interface PaginatedResult {
  items: any[];
  pageInfo: PageInfo;
}

@Injectable()
export class PaginationScale {
  private repository: Repository<any>;
  constructor() {}

  async paginate(options: PaginationOptions): Promise<PaginatedResult> {
    const { first, after, last, before, where, order, repository } = options;

    this.repository = repository;

    const queryBuilder = this.repository.createQueryBuilder('item');

    if (first) {
      this.applyAfterCondition(queryBuilder, after);
      queryBuilder.take(first + 1);
    } else if (last) {
      this.applyBeforeCondition(queryBuilder, before);
      queryBuilder.take(last + 1).orderBy('item.updatedAt', 'DESC');
    }

    if (where) {
      // Customize based on your filtering requirements
      Object.keys(where).forEach((key) => {
        queryBuilder.andWhere(`item.${key} = :${key}`, { [key]: where[key] });
      });
    }

    if (order) {
      // Customize based on your ordering requirements
      order.forEach(({ column, direction }) => {
        queryBuilder.addOrderBy(`item.${column}`, direction);
      });
    } else {
      queryBuilder.orderBy('item.updatedAt', 'ASC');
    }

    const items = await queryBuilder.getMany();

    const pageInfo: PageInfo = {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      totalCount: 0,
    };

    if (items.length > 0) {
      pageInfo.endCursor = items[items.length - 1].updatedAt.toISOString();
      pageInfo.startCursor = items[0].updatedAt.toISOString();

      if (first && items.length > first) {
        items.pop();
        pageInfo.hasNextPage = true;
      }

      if (last && items.length > last) {
        items.shift();
        pageInfo.hasPreviousPage = true;
      }
    } else if (after || before) {
      throw new NotFoundException('No more items found.');
    }

    pageInfo.totalCount = await this.repository.count();

    return { items, pageInfo };
  }

  private applyAfterCondition(
    queryBuilder: SelectQueryBuilder<any>,
    after: string,
  ): void {
    if (after) {
      queryBuilder.andWhere('item.updatedAt > :after', {
        after: new Date(parseInt(after)),
      });
    }
  }

  private applyBeforeCondition(
    queryBuilder: SelectQueryBuilder<any>,
    before: string,
  ): void {
    if (before) {
      queryBuilder.andWhere('item.updatedAt < :before', {
        before: new Date(parseInt(before)),
      });
    }
  }
}
