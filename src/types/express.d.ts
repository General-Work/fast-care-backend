import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userDetails?: {
        user: string;
        username: string;
        userId: number;
        staffDbId: number;
      };
    }
  }
}
