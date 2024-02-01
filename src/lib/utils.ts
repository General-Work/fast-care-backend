import * as bcryt from 'bcrypt';
import { SelectQueryBuilder } from 'typeorm';

export function generateDefaultPassword(): string {
  const length = 8; // Length of the default password
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Character set for the password
  let defaultPassword = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    defaultPassword += charset.charAt(randomIndex);
  }

  return defaultPassword;
}

export function encodedPassword(rawPassword: string) {
  const SALT = bcryt.genSaltSync();
  return bcryt.hashSync(rawPassword, SALT);
}

export function comparePasswords(rawPassword: string, hash: string) {
  return bcryt.compareSync(rawPassword, hash);
}

export class QueryBuilderHelper {
  static joinRelations<T>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: { name: string; entity: any; condition: string }[],
  ): SelectQueryBuilder<T> {
    relations.forEach(({ name, entity, condition }) => {
      if (condition) {
        queryBuilder.leftJoinAndMapMany(name, entity, name, condition);
      } else {
        queryBuilder.leftJoinAndSelect(`item.${name}`, name);
      }
    });

    return queryBuilder;
  }
}

export function extractColumnAndDirection(enumValue: string): {
  column: string;
  direction: string;
} {
  const [column, direction] = enumValue.split('_');

  if (direction !== 'asc' && direction !== 'desc') {
    throw new Error('Invalid sort direction');
  }

  return { column, direction: direction.toUpperCase() };
}
