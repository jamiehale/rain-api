import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';
import { ordered, filtered } from './util';

const toInboxItem = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  userId: R.prop('user_id'),
  status: R.prop('status'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toInboxItemRecord = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  user_id: R.prop('userId'),
  status: R.prop('status'),
  created_at: R.prop('createdAt'),
  updated_at: R.prop('updatedAt'),
};

const toNewInboxRecord = R.pick(['name', 'description'], toInboxItemRecord);

const toUpdatedInboxRecord = R.pick(['name', 'description', 'status'], toInboxItemRecord);

const toInboxOrder = R.omit(['user_id'], toInboxItemRecord);

const load = (db) => (userId, id) =>
  db('inbox_items')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toInboxItem)));

const loadAll =
  (db) =>
  (userId, options = {}) =>
    ordered(options.order, toInboxOrder, filtered(options.filter, toInboxOrder, db('inbox_items').where('user_id', userId))).then(
      R.map(evolveModel(toInboxItem)),
    );

const create = (db) => (userId, fields) =>
  db('inbox_items')
    .insert({
      ...evolveModel(toNewInboxRecord, fields),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toInboxItem));

const update = (db) => (userId, id, fields) =>
  db('inbox_items')
    .where('user_id', userId)
    .andWhere('id', id)
    .update({
      ...evolveModel(toUpdatedInboxRecord, fields),
      updated_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(whenNotNil(evolveModel(toInboxItem)));

export const inboxItemsRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
  update: update(db),
});
