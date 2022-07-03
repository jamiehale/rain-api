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
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toTaskDetails = {
  ...toTask,
  state: R.prop('state'),
  stateUpdatedAt: R.prop('state_updated_at'),
};

const toTaskRecord = {
  name: R.prop('name'),
  description: R.prop('description'),
  due: R.prop('due'),
  parent_id: R.prop('parentId'),
};

const load = (db) => (userId, id) =>
  db('task_details')
    .where('user_id', userId)
    .andWhere('id', id)
    .first()
    .then(whenNotNil(evolveModel(toTaskDetails)));

const loadAll = (db) => (userId) =>
  db('task_details')
    .where('user_id', userId)
    .then(R.map(evolveModel(toTaskDetails)));

const create = (db) => (userId, fields) =>
  db('tasks')
    .insert({
      ...evolveModel(toTaskRecord, fields),
      user_id: userId,
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toTask));

export const tasksRepository = (db) => ({
  load: load(db),
  loadAll: loadAll(db),
  create: create(db),
});
