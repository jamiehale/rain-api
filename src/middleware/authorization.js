import { HttpError } from '../util/errors';

export const authorized = (context, isAuthorizedFn) => (req, res, next) =>
  isAuthorizedFn(context, req, res).then((isAuthorized) => {
    if (isAuthorized) {
      next();
    } else {
      next(new HttpError('Not found', 404));
    }
  });
