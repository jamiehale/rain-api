import { Router } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import * as R from 'ramda';
import { validated } from '../../middleware/validation';

export const isErrorType = (pred) => (err) => pred(err);

const isTokenExpiredError = isErrorType((err) => err.name === 'TokenExpiredError');
const isJsonWebTokenError = isErrorType((err) => err.name === 'JsonWebTokenError');

const post = (context) => (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, context.config.jwtSecret);
    const accessToken = jwt.sign(R.pick(['userId'], payload), context.config.jwtSecret, { expiresIn: context.config.accessTokenExpiresIn });
    res.json({
      accessToken,
    });
  } catch (error) {
    if (isTokenExpiredError(error)) {
      res.status(401);
      res.json({
        message: 'Refresh token has expired',
      });
    } else if (isJsonWebTokenError(error)) {
      res.status(401);
      res.json({
        message: 'Invalid refresh token',
      });
    } else {
      next(error);
    }
  }
};

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export default (context) => {
  const routes = Router();

  routes.post('/', validated(refreshSchema), post(context));

  return routes;
};
