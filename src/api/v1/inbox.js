import { Router } from 'express';
import Joi from 'joi';
import { inboxItemsRepository } from '../../db/inbox';
import { validated } from '../../middleware/validation';
import { toJsonPayload } from '../../util/express';

const post = (context) => (req, res) =>
  inboxItemsRepository(context.db).create(res.locals.userId, res.locals.validatedBody).then(toJsonPayload(res));

const getList = (context) => (req, res) =>
  inboxItemsRepository(context.db)
    .loadAll(res.locals.userId, { order: 'createdAt', filter: { status: 'pending' } })
    .then(toJsonPayload(res));

const newInboxItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
});

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newInboxItemSchema), post(context));
  routes.get('/', getList(context));

  return routes;
};
