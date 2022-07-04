import * as R from 'ramda';
import { stripNilValues, whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';
import { ordered, filtered } from './util';

const toBookmark = {
  id: R.prop('id'),
  url: R.prop('url'),
  note: R.prop('note'),
  userId: R.prop('user_id'),
  inboxItemId: R.prop('inbox_item_id'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toBookmarkRecord = {
  id: R.prop('id'),
  url: R.prop('url'),
  note: R.prop('note'),
  user_id: R.prop('userId'),
  inbox_item_id: R.prop('inboxItemId'),
  created_at: R.prop('createdAt'),
  updated_at: R.prop('updatedAt'),
};

const toNewBookmarkRecord = R.pick(['url', 'note', 'inbox_item_id'], toBookmarkRecord);

const toUpdatedBookmarkRecord = R.pick(['url', 'note'], toBookmarkRecord);

const toBookmarkOrder = R.pick(['created_at', 'updated_at'], toBookmarkRecord);

const load = (db) => (userId, id) =>
  db('bookmarks')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toBookmark)));

const loadAll =
  (db) =>
  (userId, options = {}) =>
    ordered(options.order, toBookmarkOrder, filtered(options.filter, toBookmarkOrder, db('bookmarks').where('user_id', userId))).then(
      R.map(evolveModel(toBookmark)),
    );

const create = (db) => (userId, fields) =>
  db('bookmarks')
    .insert({
      ...stripNilValues(evolveModel(toNewBookmarkRecord, fields)),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toBookmark));

const update = (db) => (userId, id, fields) =>
  db('bookmarks')
    .where('user_id', userId)
    .andWhere('id', id)
    .update({
      ...stripNilValues(evolveModel(toUpdatedBookmarkRecord, fields)),
      updated_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(whenNotNil(evolveModel(toBookmark)));

export const bookmarksRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
  update: update(db),
});
