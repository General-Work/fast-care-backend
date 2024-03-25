import * as bcryt from 'bcrypt';
import { SelectQueryBuilder } from 'typeorm';
import { Multer } from 'multer';
import { Request } from 'express';
import * as dayjs from 'dayjs';
import { CorporateBeneficiaries } from 'src/corporate-subscribers/entities/corporate-beneficiaries.entity';
import { FamilyBeneficiaries } from 'src/family-subscribers/entities/family-beneficiaries.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { SUBSCRIBER_STANDING } from './constants';

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

export function convertFileToBase64(file: Multer.File) {
  return `data:${file.mimetype}:base64,${file.buffer.toString('base64')}`;
}

export function calculateDiscount(amount: number, discount: number) {
  return discount === 0 ? amount : amount * (discount / 100);
}

function convertObjectToQueryString(
  obj: Record<string, any>,
  deletePage?: boolean,
): string {
  if (deletePage) {
    delete obj.page;
    delete obj.pageSize;
  }

  const queryStringParams: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      queryStringParams.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`,
      );
    }
  }
  return queryStringParams.join('&');
}

export function getPaginationParams(req: Request) {
  const routeName = `${req.protocol}://${req.get('host')}${req.path}`;
  const path = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const query = req.query ? convertObjectToQueryString(req.query, true) : null;

  return {
    routeName,
    path,
    query,
  };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDaysDifferenceFromDate(dateString) {
  if (dateString === null || undefined) {
    return 0;
  }
  const givenDate = dayjs(dateString);

  const currentDate = dayjs();

  const daysDifference = currentDate.diff(givenDate, 'day');

  return daysDifference;
}

export function getCurrentPaymentDate(payments: Payment[]) {
  if (payments.length === 0 || !payments.some((p) => p.confirmed)) {
    return null; // Return null if there are no confirmed payments
  }

  // Find the latest confirmed payment date
  const latestPayment = payments.reduce(
    (latest, payment) => {
      const paymentDate = new Date(payment.dateOfPayment);
      if (payment.confirmed && paymentDate > latest.date) {
        return {
          date: paymentDate,
          daysDifference: getDaysDifferenceFromDate(paymentDate) ?? 0,
        };
      }
      return latest;
    },
    { date: new Date(0), daysDifference: 0 },
  );

  const { daysDifference } = latestPayment;

  let status: string;
  if (daysDifference <= 30) {
    status = SUBSCRIBER_STANDING.good;
  } else if (daysDifference > 30 && daysDifference <= 60) {
    status = SUBSCRIBER_STANDING.default;
  } else {
    status = SUBSCRIBER_STANDING.inactive;
  }

  return {
    currentPaymentDate: latestPayment.date,
    daysDifference: daysDifference,
    status
  };
}

export function sumPackageAmounts(
  beneficiaries: CorporateBeneficiaries[] | FamilyBeneficiaries[],
): number {
  let totalAmount = 0;
  beneficiaries.forEach((beneficiary) => {
    totalAmount += beneficiary.package.amount;
  });
  return totalAmount;
}
