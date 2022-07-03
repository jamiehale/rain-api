import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';

const toTask = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  due: R.prop('due'),
  parentId: R.prop('parent_id'),
  userId: R.prop('user_id'),
  done: R.prop('done'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toTaskRecord = {
  name: R.prop('name'),
  description: R.prop('description'),
  due: R.prop('due'),
  parent_id: R.prop('parentId'),
  done: R.prop('done'),
};

const load = (db) => (userId, id) =>
  db('tasks')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toTask)));

const loadAll = (db) => (userId) =>
  db('tasks')
    .where('user_id', userId)
    .then(R.map(evolveModel(toTask)));

const create = (db) => (userId, fields) =>
  db('tasks')
    .insert({
      ...evolveModel(toTaskRecord, fields),
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
      ...evolveModel(toTaskRecord, fields),
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
