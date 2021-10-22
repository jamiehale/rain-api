import { Router } from 'express';
import v1 from './v1';
import { version } from '../../package.json';

export default (context) => {
  const routes = Router();

  routes.get('/version', (req, res) => {
    res.json({ version });
  });

  routes.use('/v1', v1(context));

  return routes;
};

