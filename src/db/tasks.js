import * as R from 'ramda';
import { whenNotNil, stripNilValues } from '../util/fp';
import { evolveModel } from '../util/model';
import { ordered, filtered } from './util';

const toTask = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  due: R.prop('due'),
  parentId: R.prop('parent_id'),
  userId: R.prop('user_id'),
  done: R.prop('done'),
  inboxItemId: R.prop('inbox_item_id'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toTaskRecord = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  due: R.prop('due'),
  parent_id: R.prop('parentId'),
  done: R.prop('done'),
  inbox_item_id: R.prop('inboxItemId'),
  created_at: R.prop('createdAt'),
  updated_at: R.prop('updatedAt'),
};

const toNewTaskRecord = R.pick(['name', 'description', 'due', 'parent_id', 'done', 'inbox_item_id'], toTaskRecord);

const toTaskUpdatedRecord = R.pick(['name', 'description', 'due', 'parent_id', 'done', 'inbox_item_id'], toTaskRecord);

const toTaskOrder = R.pick(['due', 'created_at'], toTaskRecord);

const toTaskFilter = R.pick(['due', 'parent_id', 'done', 'inbox_item_id'], toTaskRecord);

const load = (db) => (userId, id) =>
  db('tasks')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toTask)));

const loadAll =
  (db) =>
  (userId, options = {}) =>
    ordered(options.order, toTaskOrder, filtered(options.filter, toTaskFilter, db('tasks').where('user_id', userId))).then(
      R.map(evolveModel(toTask)),
    );

const create = (db) => (userId, fields) =>
  db('tasks')
    .insert({
      ...stripNilValues(evolveModel(toNewTaskRecord, fields)),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toTask));

const update = (db) => (userId, id, fields) =>
  db('tasks')
    .where('user_id', userId)
    .andWhere('id', id)
    .update({
      ...stripNilValues(evolveModel(toTaskUpdatedRecord, fields)),
      updated_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(whenNotNil(evolveModel(toTask)));

export const tasksRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
  update: update(db),
});
