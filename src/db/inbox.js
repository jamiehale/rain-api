import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';

const toInboxItem = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  userId: R.prop('user_id'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toInboxRecord = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  user_id: R.prop('userId'),
  created_at: R.prop('createdAt'),
  updated_at: R.prop('updatedAt'),
};

const toNewInboxRecord = R.pick(['name', 'description'], toInboxRecord);

const toUpdatedInboxRecord = R.pick(['name', 'description'], toInboxRecord);

const toInboxOrder = R.omit(['user_id'], toInboxRecord);

const load = (db) => (userId, id) =>
  db('inbox')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toInboxItem)));

const stripNilValues = R.compose(
  R.fromPairs,
  R.filter((a) => !R.isNil(a[1])),
  R.toPairs,
);

const ordered = (desc, evolution, qb) => {
  if (desc) {
    if (R.type(desc) === 'Array') {
      return qb.orderBy(
        R.reduce(
          (acc, column) => {
            if (R.type(column) === 'String') {
              return [...acc, column];
            } else {
              return [...acc, ...stripNilValues(evolveModel(evolution, { [column.column]: R.propOr('asc', 'order', column) }))];
            }
          },
          [],
          desc,
        ),
      );
    } else if (R.type(desc) === 'Object') {
      return qb.orderBy([{ ...stripNilValues(evolveModel(evolution, { [desc.column]: R.propOr('asc', 'order', desc.column) })) }]);
    } else {
      return qb.orderBy([stripNilValues(evolveModel(evolution, { [desc]: 'asc' }))]);
    }
  } else {
    return qb;
  }
};

const loadAll = (db) => (userId, options) =>
  ordered(options.order, toInboxOrder, db('inbox').where('user_id', userId)).then(R.map(evolveModel(toInboxItem)));

const create = (db) => (userId, fields) =>
  db('inbox')
    .insert({
      ...evolveModel(toNewInboxRecord, fields),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toInboxItem));

const update = (db) => (userId, id, fields) =>
  db('inbox')
    .where('user_id', userId)
    .andWhere('id', id)
    .update({
      ...evolveModel(toUpdatedInboxRecord, fields),
      updated_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(whenNotNil(evolveModel(toInboxItem)));

export const inboxRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
  update: update(db),
});
