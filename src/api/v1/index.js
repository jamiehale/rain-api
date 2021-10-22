import { Router } from 'express';

const get = () => (req, res) => {
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

