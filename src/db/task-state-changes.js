import * as R from 'ramda';
import { evolveModel } from '../util/model';

const toTaskStateChange = {
  taskId: R.prop('task_id'),
  state: R.prop('state'),
  createdAt: R.prop('created_at'),
};

const toTaskStateChangeRecord = {
  task_id: R.prop('taskId'),
  state: R.prop('state'),
};

const create = (db) => (fields) =>
  db('task_state_changes')
    .insert({
      ...evolveModel(toTaskStateChangeRecord, fields),
      created_at: db.fn.now(),
    })
    .returning('*')
    .then(R.head)
    .then(evolveModel(toTaskStateChange));

export const taskStateChangesRepository = (db) => ({
  create: create(db),
});
