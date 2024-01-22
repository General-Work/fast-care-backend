import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

export type OrderDirection = 'ASC' | 'DESC';

export type OrderBy = { column: string; direction: OrderDirection };

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  order?: OrderBy[];
  repository?: Repository<any>;
  routeName: string;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

export interface INewPaginate {
  currentPage: string | number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  perPage: number;
  total: number;
  lastPageUrl: string | null;
  firstPageUrl: string | null;
}

export interface PaginatedResult {
  data: any[];
  pageInfo: PageInfo;
  newPageInfo: INewPaginate;
}

@Injectable()
export class PaginationService {
  private repository: Repository<any>;

  constructor() {}

  async paginate<T>(options: PaginationOptions): Promise<PaginatedResult> {
    const { page, pageSize, filter, order, repository, routeName } = options;
    this.repository = repository;

    const queryBuilder = this.createPaginationQueryBuilder(page, pageSize);

    if (filter) {
      this.applyWhereConditions(queryBuilder, filter);
    }

    if (order) {
      this.applyOrderConditions(queryBuilder, order);
    } else {
      queryBuilder.orderBy('item.updatedAt', 'ASC');
    }

    const [items, totalCount] = await queryBuilder.getManyAndCount();
    const pageInfo = this.calculatePageInfo(page, pageSize, totalCount);

    const newPage = +page;
    const nextPageUrl = pageInfo.hasNextPage
      ? `${routeName}?page=${newPage + 1}&pageSize=${pageSize}`
      : null;
    const prevPageUrl =
      pageInfo.hasPreviousPage && newPage > 1
        ? `${routeName}?page=${newPage - 1}&pageSize=${pageSize}`
        : null;

    return {
      data: items,
      pageInfo,
      newPageInfo: {
        currentPage: pageInfo.currentPage,
        nextPageUrl,
        prevPageUrl,
        perPage: pageSize,
        total: totalCount,
        lastPageUrl: `${routeName}?page=${pageInfo.totalPages}&pageSize=${pageSize}`,
        firstPageUrl: `${routeName}?page=1&pageSize=${pageSize}`,
      },
    };
  }

  private createPaginationQueryBuilder(
    page: number = 1,
    pageSize: number = 10,
  ): SelectQueryBuilder<any> {
    const skip = (page - 1) * pageSize;

    return this.repository.createQueryBuilder('item').skip(skip).take(pageSize);
  }

  private applyWhereConditions(
    queryBuilder: SelectQueryBuilder<any>,
    where: Record<string, any>,
  ): void {
    Object.entries(where).forEach(([key, value]) => {
      if (typeof value === 'string') {
        queryBuilder.andWhere(`item.${key} LIKE :${key}`, {
          [key]: `%${value}%`,
        });
      } else {
        queryBuilder.andWhere(`item.${key} = :${key}`, { [key]: value });
      }
    });
  }

  private applyOrderConditions(
    queryBuilder: SelectQueryBuilder<any>,
    order: { column: string; direction: 'ASC' | 'DESC' }[],
  ): void {
    order.forEach(({ column, direction }) => {
      queryBuilder.addOrderBy(`item.${column}`, direction);
    });
  }

  private calculatePageInfo(
    page: number,
    pageSize: number,
    totalCount: number,
  ): PageInfo {
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalCount,
    };
  }
}
