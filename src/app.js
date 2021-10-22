import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as R from 'ramda';
import { HttpError  } from './util/errors';
import api from './api';

const createApp = (context) => {
  const app = express();
  app.use(helmet());
  app.set('etag', false);

  app.use(cors());

  app.use(
    logger(
      app.get('env') === 'development' ? 'dev' : 'common',
      {
        skip: () => app.get('env') === 'test',
      },
    ),
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.get('/', (req, res) => { res.json({ status: 'OK' }); });
  app.use('/api', api(context));

  app.use((req, res, next) => {
    const err = new HttpError('Not Found', 404);
    next(err);
  });

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    let status = 500;
    if (R.has('status', err)) {
      status = err.status;
    } else {
      console.log('Error:', err); // eslint-disable-line no-console
    }
    res
      .status(status)
      .json({
        message: status === 500 ? 'Internal error' : err.message,
      });
  });

  return app;
};

export default createApp;

