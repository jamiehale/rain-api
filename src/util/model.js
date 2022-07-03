import * as R from 'ramda';

export const evolveModel = R.curry((evolution, record) =>
  R.compose(
    R.reduce((acc, [name, evolver]) => R.assoc(name, evolver(record), acc), {}),
    R.toPairs,
  )(evolution),
);
