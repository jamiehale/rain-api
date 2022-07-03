import * as R from 'ramda';
import { HttpError } from '../util/errors';
import { capitalize } from '../util/fp';

export const validated =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.options({ allowUnknown: true, stripUnknown: true }).validate(req[source]);
    if (error) {
      next(new HttpError(error, 400));
    } else {
      res.locals[`validated${capitalize(source)}`] = R.mergeLeft(value, R.propOr({}, `validated${capitalize(source)}`, res.locals));
      next();
    }
  };
