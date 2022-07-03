import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';

const toLocalAccount = {
  id: R.prop('id'),
  username: R.prop('username'),
  userId: R.prop('user_id'),
  salt: R.prop('salt'),
  saltedPassword: R.prop('salted_password'),
  status: R.prop('status'),
  createdAt: R.prop('created_at'),
  updatedAt: R.prop('updated_at'),
};

const toLocalAccountRecord = {
  username: R.prop('username'),
  user_id: R.prop('userId'),
  salt: R.prop('salt'),
  salted_password: R.prop('saltedPassword'),
  status: R.prop('status'),
};

const loadByUsername = (db) => (username) =>
  db('local_accounts')
    .where('username', username)
    .first()
    .then(whenNotNil(evolveModel(toLocalAccount)));

const create = (db) => (fields) =>
  db('local_accounts').insert(evolveModel(toLocalAccountRecord, fields)).returning('*').then(evolveModel(toLocalAccount));

export const localAccountsRepository = (db) => ({
  loadByUsername: loadByUsername(db),
  create: create(db),
});
