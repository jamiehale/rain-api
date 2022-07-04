import { Router } from 'express';
import Joi from 'joi';
import * as R from 'ramda';
import { withTransaction } from '../../db/atomic';
import { bookmarksRepository } from '../../db/bookmarks';
import { inboxItemsRepository } from '../../db/inbox';
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
      .then(() => bookmarksRepository(txn).create(res.locals.userId, res.locals.validatedBody))
      .then(toJsonPayload(res)),
  );

const getList = (context) => (req, res) =>
  bookmarksRepository(context.db)
    .loadAll(res.locals.userId, { order: { column: 'createdAt', order: 'desc' } })
    .then(toJsonPayload(res));

const get = (context) => (req, res) =>
  bookmarksRepository(context.db)
    .load(res.locals.userId, res.locals.validatedParams.id)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const patch = (context) => (req, res) =>
  bookmarksRepository(context.db)
    .update(res.locals.userId, res.locals.validatedParams.id, res.locals.validatedBody)
    .then(throwIfNil(() => new HttpError('Not found', 404)))
    .then(toJsonPayload(res));

const newBookmarkSchema = Joi.object({
  url: Joi.string().required(),
  note: Joi.string(),
  inboxItemId: Joi.string(),
});

const updatedBookmarkSchema = Joi.object({
  url: Joi.string(),
  note: Joi.string(),
});

const bookmarkIdSchema = Joi.object({
  id: Joi.string(),
});

const bookmarkReadableBy = (bookmarkIdFn) => (context, req, res) =>
  bookmarksRepository(context.db).load(res.locals.userId, bookmarkIdFn(req, res)).then(R.complement(R.isNil));

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newBookmarkSchema), post(context));
  routes.get('/', getList(context));
  routes.get(
    '/:id',
    validated(bookmarkIdSchema, 'params'),
    authorized(
      context,
      bookmarkReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    get(context),
  );
  routes.patch(
    '/:id',
    validated(bookmarkIdSchema, 'params'),
    validated(updatedBookmarkSchema),
    authorized(
      context,
      bookmarkReadableBy((req, res) => res.locals.validatedParams.id),
    ),
    patch(context),
  );

  return routes;
};
