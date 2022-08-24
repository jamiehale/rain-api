import { Router } from 'express';
import { authenticated } from '../../middleware/authentication';
import auth from './auth';
import refresh from './refresh';
import sessions from './sessions';

export default (context) => {
  const routes = Router();

  routes.use('/sessions', sessions(context));
  routes.use('/refresh', refresh(context));
  routes.use('/auth', authenticated(context), auth(context));

  return routes;
};
