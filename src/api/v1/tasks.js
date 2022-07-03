import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { withTransaction } from '../../db/atomic';
import { inboxItemsRepository } from '../../db/inbox';
import { tasksRepository } from '../../db/tasks';
import { authorized } from '../../middleware/authorization';
import { validated } from '../../middleware/validation';
import { HttpError } from '../../util/errors';
import { toJsonPayload } from '../../util/express';
import { throwIfNil } from '../../util/fp';

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
    updateInboxItem(txn, res.locals.user.id, res.locals.validatedBody.inboxItemId, 'processed')
      .then(() => tasksRepository(txn).create(res.locals.user.id, res.locals.validatedBody))
      .then(toJsonPayload(res)),
  );

const getList = (context) => (req, res) => tasksRepository(context.db).loadAll(res.locals.user.id).then(toJsonPayload(res));

const get = (context) => (req, res) =>
  tasksRepository(context.db)
    .load(res.locals.user.id, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const patch = (context) => (req, res) =>
  tasksRepository(context.db)
    .update(res.locals.user.id, res.locals.validatedParams.id, res.locals.validatedBody)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const newTaskSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  due: Joi.date(),
  parentId: Joi.string(),
  inboxItemId: Joi.string(),
});

const updatedTaskSchema = Joi.object({
  done: Joi.boolean(),
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
