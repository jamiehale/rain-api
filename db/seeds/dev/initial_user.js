import { localAccountsRepository } from '../../../src/db/local-accounts';
import { generateSalt, saltPassword } from '../../../src/util/password';

const reset = (knex) =>
  Promise.resolve()
    .then(() => knex('user_apps').del())
    .then(() => knex('users').del());

const jamie = {
  id: 'b722f8c9-cd86-494f-96a1-cf1c3467accb',
  display_name: 'jamie',
};

const jamieApp = {
  id: '6bad08b8-2dc4-43a5-a278-311b86b0c64f',
  name: 'Test App',
  user_id: jamie.id,
  key: '497d7ee5fb944b38926cb80dbca32864',
};

const jamieAccount = {
  username: 'jamie',
  userId: jamie.id,
  password: 'password',
};

const account = (record) => {
  const salt = generateSalt();
  const saltedPassword = saltPassword(record.password, salt);
  return {
    username: record.username,
    userId: record.userId,
    salt: salt,
    saltedPassword: saltedPassword,
  };
};

exports.seed = (knex) =>
  reset(knex)
    .then(() => knex('users').insert([jamie]))
    .then(() => knex('user_apps').insert([jamieApp]))
    .then(() => localAccountsRepository(knex).create(account(jamieAccount)));
