// extract-user.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

@Injectable()
export class ExtractUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res
          .status(401)
          .json({
            error: 'Unauthorized',
            message: 'Token verification failed',
          });
      }
      // console.log(user)
      req.userDetails = user;
      next();
    })(req, res, next);
  }
}
