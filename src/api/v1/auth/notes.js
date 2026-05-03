import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { withTransaction } from '../../../db/atomic';
import { inboxItemsRepository } from '../../../db/inbox';
import { notesRepository } from '../../../db/notes';
import { HttpError } from '../../../util/errors';
import { toJsonPayload } from '../../../util/express';
import { throwIfNil } from '../../../util/fp';

const updateInboxItem = (txn, userId, inboxItemId, status) => {
  if (inboxItemId) {
    return inboxItemsRepository(txn)
      .update(userId, inboxItemId, { status })
      .then(throwIfNil(() => new HttpError('Note not found', 400)));
  }
  return Promise.resolve();
};

const post =
  (context) =>
  ({ userId, inboxItemId, ...fields }) =>
    withTransaction(context.db, (txn) =>
      updateInboxItem(txn, userId, inboxItemId, 'processed').then(() => notesRepository(txn).create(userId, { inboxItemId, ...fields })),
    );

const getList =
  (context) =>
  ({ userId }) =>
    notesRepository(context.db).loadAll(userId, { order: 'createdAt' });

const get =
  (context) =>
  ({ userId, noteId }) =>
    notesRepository(context.db)
      .load(userId, noteId)
      .then(throwIfNil(() => new HttpError('Not found', 404)));

const patch =
  (context) =>
  ({ userId, noteId, ...fields }) =>
    notesRepository(context.db)
      .update(userId, noteId, fields)
      .then(throwIfNil(() => new HttpError('Not found', 404)));

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

const extractUser = (req, res) => ({
  userId: res.locals.userId,
});

const extract = (schema, o) => {
  const { error, value } = schema.options({ allowUnknown: true, stripUnknown: true }).validate(o);
  if (error) {
    throw new Error(error, 400);
  }
  return value;
};

const extractParams = (schema) => (req) => extract(schema, req.params);

const extractBody = (schema) => (req) => extract(schema, req.body);

// const extractQuery = (schema) => (req) => extract(schema, req.query);

const something = (middlewares, fn) => (req, res) => {
  fn(R.reduce((acc, middleware) => ({ ...acc, ...middleware(req, res, acc) }), {}, middlewares)).then(toJsonPayload(res));
};

const authorized = (isAuthorizedFn) => (req, res, props) => {
  if (!isAuthorizedFn(props)) {
    throw new HttpError('Not found', 404);
  }

  return {};
};

const canAccessNote =
  (context) =>
  ({ userId, noteId }) =>
    notesRepository(context.db).load(userId, noteId).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', something([extractUser, extractBody(newNoteSchema)], post(context)));

  routes.get('/', something([extractUser], getList(context)));

  routes.get('/:noteId', something([extractUser, extractParams(noteIdSchema), authorized(canAccessNote(context))], get(context)));

  routes.patch(
    '/:noteId',
    something(
      [extractUser, extractParams(noteIdSchema), authorized(canAccessNote(context)), extractBody(updatedNoteSchema)],
      patch(context),
    ),
  );

  return routes;
};
