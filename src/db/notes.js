import * as R from 'ramda';
import { stripNilValues, whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';
import { ordered, filtered } from './util';

const toNote = {
  id: R.prop('id'),
  name: R.prop('name'),
  body: R.prop('body'),
  userId: R.prop('user_id'),
  inboxItemId: R.prop('inbox_item_id'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toNoteRecord = {
  id: R.prop('id'),
  name: R.prop('name'),
  body: R.prop('body'),
  user_id: R.prop('userId'),
  inbox_item_id: R.prop('inboxItemId'),
  created_at: R.prop('createdAt'),
  updated_at: R.prop('updatedAt'),
};

const toNewNoteRecord = R.pick(['name', 'body', 'inbox_item_id'], toNoteRecord);

const toUpdatedNoteRecord = R.pick(['name', 'body'], toNoteRecord);

const toNoteOrder = R.pick(['name', 'created_at', 'updated_at'], toNoteRecord);

const load = (db) => (userId, id) =>
  db('notes')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toNote)));

const loadAll =
  (db) =>
  (userId, options = {}) =>
    ordered(options.order, toNoteOrder, filtered(options.filter, toNoteOrder, db('notes').where('user_id', userId))).then(
      R.map(evolveModel(toNote)),
    );

const create = (db) => (userId, fields) =>
  db('notes')
    .insert({
      ...stripNilValues(evolveModel(toNewNoteRecord, fields)),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toNote));

const update = (db) => (userId, id, fields) =>
  db('notes')
    .where('user_id', userId)
    .andWhere('id', id)
    .update({
      ...stripNilValues(evolveModel(toUpdatedNoteRecord, fields)),
      updated_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(whenNotNil(evolveModel(toNote)));

export const notesRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
  update: update(db),
});
