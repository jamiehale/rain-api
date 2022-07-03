import { Router } from 'express';
import Joi from 'joi';
import { localAccountsRepository } from '../../db/local-accounts';
import { validated } from '../../middleware/validation';
import { HttpError } from '../../util/errors';
import { throwIfNil, throwUnless } from '../../util/fp';
import { isPasswordValid } from '../../util/password';
import { toJsonPayload } from '../../util/express';
import { generateAuthPackage } from '../../util/auth-package';

const post = (context) => (req, res) =>
  localAccountsRepository(context.db)
    .loadByUsername(res.locals.validatedBody.username)
    .then(throwIfNil(() => new HttpError('Invalid username/password combination', 401)))
    .then(
      throwUnless(isPasswordValid(res.locals.validatedBody.password), () => new HttpError('Invalid username/password combination', 401)),
    )
    .then(generateAuthPackage(context))
    .then(toJsonPayload(res));

const newSessionSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export default (context) => {
  const routes = Router();

  routes.post('/', validated(newSessionSchema), post(context));

  return routes;
};
