import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { inboxItemsRepository } from '../../../db/inbox';
import { authorized } from '../../../middleware/authorization';
import { validated } from '../../../middleware/validation';
import { HttpError } from '../../../util/errors';
import { toJsonPayload } from '../../../util/express';
import { throwIfNil } from '../../../util/fp';

const post = (context) => (req, res) =>
  inboxItemsRepository(context.db).create(res.locals.userId, res.locals.validatedBody).then(toJsonPayload(res));

const getList = (context) => (req, res) =>
  inboxItemsRepository(context.db)
    .loadAll(res.locals.userId, { order: 'createdAt', filter: { status: 'pending' } })
    .then(toJsonPayload(res));

const patch = (context) => (req, res) =>
  inboxItemsRepository(context.db)
    .update(res.locals.userId, res.locals.validatedParams.id, res.locals.validatedBody)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const del = (context) => (req, res) =>
  inboxItemsRepository(context.db)
    .delete(res.locals.userId, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const newInboxItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
});

const updatedInboxItemSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
});

const inboxItemIdSchema = Joi.object({
  id: Joi.string(),
});

const inboxItemReadableBy = (inboxItemFn) => (context, req, res) =>
  inboxItemsRepository(context.db).load(res.locals.userId, inboxItemFn(req, res)).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newInboxItemSchema), post(context));
  routes.get('/', getList(context));
  routes.patch(
    '/:id',
    validated(inboxItemIdSchema, 'params'),
    validated(updatedInboxItemSchema),
    authorized(
      context,
      inboxItemReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    patch(context),
  );
  routes.delete(
    '/:id',
    validated(inboxItemIdSchema, 'params'),
    authorized(
      context,
      inboxItemReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    del(context),
  );

  return routes;
};
