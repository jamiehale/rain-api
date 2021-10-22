import { config } from 'dotenv';
import * as R from 'ramda';

config();

const {
  PORT = 8080,
  DB_HOST = 'pg',
  DB_USER = 'rain_api',
  DB_PASSWORD = 'rain',
  DB_DATABASE = 'rain',
} = process.env;

const redact = (s) => R.join('', R.map(R.always('X'), s));

console.log(`PORT = ${PORT}`);
console.log(`DB_HOST = ${DB_HOST}`);
console.log(`DB_USER = ${DB_USER}`);
console.log(`DB_PASSWORD = ${redact(DB_PASSWORD)}`);
console.log(`DB_DATABASE = ${DB_DATABASE}`);

export default {
  port: PORT,
  dbHost: DB_HOST,
  dbUser: DB_USER,
  dbPassword: DB_PASSWORD,
  dbDatabase: DB_DATABASE,
};

