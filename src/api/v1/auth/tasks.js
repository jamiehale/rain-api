import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import endOfToday from 'date-fns/endOfToday';
import { withTransaction } from '../../../db/atomic';
import { inboxItemsRepository } from '../../../db/inbox';
import { tasksRepository } from '../../../db/tasks';
import { authorized } from '../../../middleware/authorization';
import { validated } from '../../../middleware/validation';
import { HttpError } from '../../../util/errors';
import { toJsonPayload } from '../../../util/express';
import { throwIfNil, notNil } from '../../../util/fp';

const updateInboxItem = (txn, userId, inboxItemId, status) => {
  if (inboxItemId) {
    return inboxItemsRepository(txn)
      .update(userId, inboxItemId, { status })
      .then(throwIfNil(() => new HttpError('Inbox item not found', 400)));
  }
  return Promise.resolve();
};

const post = (context) => (req, res) =>
  withTransaction(context.db, (txn) =>
    updateInboxItem(txn, res.locals.userId, res.locals.validatedBody.inboxItemId, 'processed')
      .then((o) => {
        console.log(res.locals.validatedBody);
        return o;
      })
      .then(() => tasksRepository(txn).create(res.locals.userId, res.locals.validatedBody))
      .then(toJsonPayload(res)),
  );

const listIs = R.curry((value, list) =>
  R.equals(
    R.sort((a, b) => a.localeCompare(b), list),
    value,
  ),
);

const getList = (context) => (req, res) => {
  let options = {};

  const filterTypes = R.pathOr([], ['locals', 'validatedQuery', 'types'], res);
  if (listIs(['due', 'overdue'], filterTypes)) {
    options.filter = R.assoc('due', { lte: endOfToday() }, R.propOr({}, 'filter', options));
  }

  const filterDone = R.path(['locals', 'validatedQuery', 'done'], res);
  if (notNil(filterDone)) {
    options.filter = R.assoc('done', filterDone, R.propOr({}, 'filter', options));
  }

  return tasksRepository(context.db)
    .loadAll(res.locals.userId, options)
    .then((tasks) => {
      console.log(tasks);
      return tasks;
    })
    .then(toJsonPayload(res));
};

const get = (context) => (req, res) =>
  tasksRepository(context.db)
    .load(res.locals.userId, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const patch = (context) => (req, res) =>
  tasksRepository(context.db)
    .update(res.locals.userId, res.locals.validatedParams.id, res.locals.validatedBody)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const newTaskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  due: Joi.date(),
  parentId: Joi.string(),
  inboxItemId: Joi.string(),
});

const getTaskListSchema = Joi.object({
  types: Joi.array().items(Joi.string().valid('due', 'overdue', 'upcoming', 'next')),
  done: Joi.boolean(),
});

const updatedTaskSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  due: Joi.date(),
  done: Joi.boolean(),
});

const taskIdSchema = Joi.object({
  id: Joi.string(),
});

const taskReadableBy = (taskIdFn) => (context, req, res) =>
  tasksRepository(context.db).load(res.locals.userId, taskIdFn(req, res)).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newTaskSchema), post(context));
  routes.get('/', validated(getTaskListSchema, 'query'), getList(context));
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
