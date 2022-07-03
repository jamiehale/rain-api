import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { withTransaction } from '../../db/atomic';
import { inboxItemsRepository } from '../../db/inbox';
import { notesRepository } from '../../db/notes';
import { authorized } from '../../middleware/authorization';
import { validated } from '../../middleware/validation';
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
    updateInboxItem(txn, res.locals.userId, res.locals.validatedBody.inboxItemId, 'processed')
      .then(() => notesRepository(txn).create(res.locals.userId, res.locals.validatedBody))
      .then(toJsonPayload(res)),
  );

const getList = (context) => (req, res) =>
  notesRepository(context.db).loadAll(res.locals.userId, { order: 'createdAt' }).then(toJsonPayload(res));

const get = (context) => (req, res) =>
  notesRepository(context.db)
    .load(res.locals.userId, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const patch = (context) => (req, res) =>
  notesRepository(context.db)
    .update(res.locals.userId, res.locals.validatedParams.id, res.locals.validatedBody)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const newNoteSchema = Joi.object({
  name: Joi.string().required(),
  body: Joi.string(),
  inboxItemId: Joi.string(),
});

const updatedNoteSchema = Joi.object({
  name: Joi.string(),
  body: Joi.string(),
});

const noteIdSchema = Joi.object({
  id: Joi.string(),
});

const noteReadableBy = (noteIdFn) => (context, req, res) =>
  notesRepository(context.db).load(res.locals.userId, noteIdFn(req, res)).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newNoteSchema), post(context));
  routes.get('/', getList(context));
  routes.get(
    '/:id',
    validated(noteIdSchema, 'params'),
    authorized(
      context,
      noteReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    get(context),
  );
  routes.patch(
    '/:id',
    validated(noteIdSchema, 'params'),
    validated(updatedNoteSchema),
    authorized(
      context,
      noteReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    patch(context),
  );

  return routes;
};
