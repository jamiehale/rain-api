import * as R from 'ramda';

export const nilOrEmpty = R.or(R.isNil, R.isEmpty);
export const lengthEquals = R.curry((n, a) => a.length === n);
export const lengthNotEquals = R.curry((n, a) => a.length !== n);

export const throwIf = R.curry((pred, createErrorFn, value) => {
  if (pred(value)) {
    throw createErrorFn(value);
  }

  return value;
});

export const throwUnless = R.curry((pred, createErrorFn, value) => throwIf(R.complement(pred), createErrorFn, value));

export const throwIfNil = throwIf(R.isNil);

export const notNil = R.complement(R.isNil);

export const whenNotNil = R.when(notNil);

export const passThrough = R.curry((f, value) => {
  f(value);
  return value;
});

export const capitalize = (s) => R.join('', [R.toUpper(R.head(s)), R.tail(s)]);

export const stripNilValues = R.compose(
  R.fromPairs,
  R.filter((a) => !R.isNil(a[1])),
  R.toPairs,
);
