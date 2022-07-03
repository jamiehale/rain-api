import config from './config';
import connectDb from './db';
import createApp from './app';

const run = () => {
  connectDb(config.dbHost, config.dbUser, config.dbPassword, config.dbDatabase).then((db) => {
    createApp({ config, db }).listen(config.port, () => {
      console.log(`Listening on port ${config.port}`); // eslint-disable-line no-console
    });
  });
};

run();
