import { Router } from 'express';
import * as R from 'ramda';

const get = (context) => (req, res, next) => {
  res.json([
    { yay: 'hells yes' },
  ]);
};

const events = (context) => {
  const routes = Router();

  routes.get('/', get(context));

  return routes;
};

export default (context) => {
  const routes = Router();

  routes.use('/events', events(context));

  return routes;
};

