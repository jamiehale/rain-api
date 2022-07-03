import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { withTransaction } from '../../db/atomic';
import { taskStateChangesRepository } from '../../db/task-state-changes';
import { tasksRepository } from '../../db/tasks';
import { authorized } from '../../middleware/authorization';
import { validated } from '../../middleware/validation';
import { HttpError } from '../../util/errors';
import { passThrough, throwIfNil } from '../../util/fp';

const post = (context) => (req, res) =>
  withTransaction(context.db, (txn) =>
    tasksRepository(txn)
      .create(res.locals.user.id, res.locals.validatedBody)
      .then(passThrough((task) => taskStateChangesRepository(txn).create({ taskId: task.id, state: 'pending' })))
      .then((task) => tasksRepository(txn).load(res.locals.user.id, task.id))
      .then((task) => {
        res.json(task);
      }),
  );

const getList = (context) => (req, res) =>
  tasksRepository(context.db)
    .loadAll(res.locals.user.id)
    .then((tasks) => {
      res.json(tasks);
    });

const get = (context) => (req, res) =>
  tasksRepository(context.db)
    .load(res.locals.user.id, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then((tasks) => {
      res.json(tasks);
    });

const patch = (context) => (req, res) =>
  withTransaction(context.db, (txn) =>
    tasksRepository(txn)
      .load(res.locals.user.id, res.locals.validatedParams.id)
      .then(
        passThrough((task) => {
          if (res.locals.validatedBody.state && task.state !== res.locals.validatedBody.state) {
            return taskStateChangesRepository(txn).create({ taskId: task.id, state: res.locals.validatedBody.state });
          }
        }),
      )
      .then((task) => tasksRepository(txn).load(res.locals.user.id, task.id))
      .then((task) => {
        res.json(task);
      }),
  );

const newTaskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  due: Joi.date(),
  parentId: Joi.string(),
});

const updatedTaskSchema = Joi.object({
  state: Joi.valid('pending', 'done'),
});

const taskIdSchema = Joi.object({
  id: Joi.string(),
});

const taskReadableBy = (taskIdFn) => (context, req, res) =>
  tasksRepository(context.db).load(res.locals.user.id, taskIdFn(req, res)).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newTaskSchema), post(context));
  routes.get('/', getList(context));
  routes.get(
    '/:id',
    validated(taskIdSchema, 'params'),
    authorized(
      context,
      taskReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    get(context),
  );
  routes.patch(
    '/:id',
    validated(taskIdSchema, 'params'),
    validated(updatedTaskSchema),
    authorized(
      context,
      taskReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    patch(context),
  );

  return routes;
};
