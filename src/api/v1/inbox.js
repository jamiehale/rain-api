import { Router } from 'express';
import Joi from 'joi';
import { inboxRepository } from '../../db/inbox';
import { validated } from '../../middleware/validation';
import { toJsonPayload } from '../../util/express';

const post = (context) => (req, res) =>
  inboxRepository(context.db).create(res.locals.user.id, res.locals.validatedBody).then(toJsonPayload(res));

const getList = (context) => (req, res) =>
  inboxRepository(context.db).loadAll(res.locals.user.id, { order: 'createdAt' }).then(toJsonPayload(res));

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
