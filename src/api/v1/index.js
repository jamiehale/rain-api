import { Router } from 'express';
import { authenticated } from '../../middleware/authentication';
import inbox from './inbox';
import notes from './notes';
import sessions from './sessions';
import tasks from './tasks';

export default (context) => {
  const routes = Router();

  routes.use('/sessions', sessions(context));
  routes.use('/tasks', authenticated(context), tasks(context));
  routes.use('/notes', authenticated(context), notes(context));
  routes.use('/inbox', authenticated(context), inbox(context));

  return routes;
};
