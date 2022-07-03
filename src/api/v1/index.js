import { Router } from 'express';
import { authenticated } from '../../middleware/authentication';
import sessions from './sessions';
import tasks from './tasks';

export default (context) => {
  const routes = Router();

  routes.use('/sessions', sessions(context));
  routes.use('/tasks', authenticated(context), tasks(context));

  return routes;
};
