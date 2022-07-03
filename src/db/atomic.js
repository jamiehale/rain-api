import * as R from 'ramda';

export const withTransaction = R.curry((db, f) =>
  db.transaction().then((txn) =>
    f(txn)
      .then((value) => {
        txn.commit();
        return value;
      })
      .catch((e) => {
        txn.rollback();
        throw e;
      }),
  ),
);
