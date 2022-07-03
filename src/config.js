import process from 'process';
import { config } from 'dotenv';
import * as R from 'ramda';

config();

const {
  PORT = 8080,
  DB_HOST = 'pg',
  DB_USER = 'rain_api',
  DB_PASSWORD = 'rain',
  DB_DATABASE = 'rain',
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN = '3h',
  REFRESH_TOKEN_EXPIRES_IN = '1d',
} = process.env;

const redact = R.compose(R.join(''), R.map(R.always('X')));

console.log(`PORT = ${PORT}`);
console.log(`DB_HOST = ${DB_HOST}`);
console.log(`DB_USER = ${DB_USER}`);
console.log(`DB_PASSWORD = ${redact(DB_PASSWORD)}`);
console.log(`DB_DATABASE = ${DB_DATABASE}`);
console.log(`JWT_SECRET = ${redact(JWT_SECRET)}`);
console.log(`ACCESS_TOKEN_EXPIRES_IN = ${ACCESS_TOKEN_EXPIRES_IN}`);
console.log(`REFRESH_TOKEN_EXPIRES_IN = ${REFRESH_TOKEN_EXPIRES_IN}`);

export default {
  port: PORT,
  dbHost: DB_HOST,
  dbUser: DB_USER,
  dbPassword: DB_PASSWORD,
  dbDatabase: DB_DATABASE,
  jwtSecret: JWT_SECRET,
  accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
};
