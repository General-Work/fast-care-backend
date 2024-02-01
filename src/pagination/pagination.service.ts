import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, Like } from 'typeorm';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderBy = { column: string; direction: OrderDirection };

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  order?: OrderBy[];
  repository?: Repository<any> | SelectQueryBuilder<any>;
  routeName: string;
  relations?: string[];
  search?: string; // Add search field
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
  async paginate<T>(options: PaginationOptions): Promise<PaginatedResult> {
    const {
      page,
      pageSize,
      filter,
      order,
      repository,
      routeName,
      relations,
      search,
    } = options;

    let queryBuilder: SelectQueryBuilder<T>;

    if (repository instanceof Repository) {
      queryBuilder = this.createPaginationQueryBuilder(
        page,
        pageSize,
        repository,
      );
    } else if (repository instanceof SelectQueryBuilder) {
      queryBuilder = repository;
    } else {
      throw new Error(
        'Invalid repository type. Must be Repository or SelectQueryBuilder.',
      );
    }

    if (filter) {
      this.applyWhereConditions(queryBuilder, filter);
    }

    if (search) {
      this.applySearchConditions(queryBuilder, search);
    }

    if (order) {
      this.applyOrderConditions(queryBuilder, order);
    } else {
      queryBuilder.orderBy('item.updatedAt', 'ASC');
    }

    if (relations) {
      this.applyRelations(queryBuilder, relations);
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

  private createPaginationQueryBuilder<T>(
    page: number = 1,
    pageSize: number = 10,
    repository: Repository<T>,
  ): SelectQueryBuilder<T> {
    const skip = (page - 1) * pageSize;
    return repository.createQueryBuilder('item').skip(skip).take(pageSize);
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

  private applySearchConditions<T>(
    queryBuilder: SelectQueryBuilder<T>,
    search: string,
  ): void {
    const entityColumns =
      queryBuilder.expressionMap.mainAlias.metadata.columns.map(
        (column) => column.propertyName,
      );
    const searchConditions = entityColumns.map(
      (column) => `${queryBuilder.alias}.${column} LIKE :search`,
    );

    queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, {
      search: `%${search}%`,
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

  private applyRelations<T>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[],
  ): SelectQueryBuilder<T> {
    relations.forEach((relation) => {
      const nestedRelations = relation.split('.');
      nestedRelations.reduce((builder, rel) => {
        return builder.leftJoinAndSelect(`item.${rel}`, rel);
      }, queryBuilder);
    });

    return queryBuilder;
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
