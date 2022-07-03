import * as R from 'ramda';
import jwt from 'jsonwebtoken';
import { HttpError } from '../util/errors';
import { usersRepository } from '../db/users';
import { userAppsRepository } from '../db/user-apps';
import { lengthNotEquals, nilOrEmpty, throwIf, throwIfNil } from '../util/fp';

const extractToken = (authHeader) => {
  throwIf(nilOrEmpty, () => new HttpError('No Authorization header', 401), authHeader);

  const authParts = R.split(' ', authHeader);
  throwIf(lengthNotEquals(2), () => new HttpError('Improper Authorization header format', 401), authParts);
  throwIf(R.complement(R.equals('Bearer')), () => new HttpError('Improper Authorization header format', 401), authParts[0]);

  const token = authParts[1];
  throwIf(nilOrEmpty, () => new HttpError('No Bearer token', 401), token);

  return token;
};

export const authenticated = (context) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  try {
    const token = extractToken(authHeader);

    const userApp = await userAppsRepository(context.db).loadByKey(token);
    if (!R.isNil(userApp)) {
      res.locals.userId = userApp.userId;
      next();
    } else {
      jwt.verify(token, context.config.jwtSecret, (error, payload) => {
        if (error) {
          throw new HttpError(error.toString(), 401);
        }
        res.locals.userId = payload.userId;
        next();
      });
    }
  } catch (error) {
    next(error);
  }
};
