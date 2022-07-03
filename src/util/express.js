import * as R from 'ramda';

export const toJsonPayload = R.curry((res, o) => {
  res.json(o);
});
